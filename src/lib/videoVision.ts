import Busboy from "busboy";
import { spawn } from "child_process";
import fs from "fs/promises";
import os from "os";
import path from "path";
import ffmpegPath from "ffmpeg-static";
import { NextApiRequest } from "next";
import { VISION_SUPPORTED_LANGUAGES } from "./googleVision";
import { cleanText } from "./searchResults";

export interface VisionVideoFormData {
  fields: { language?: string };
  fileBuffer: Buffer;
  mimeType?: string;
}

export const VISION_MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_VIDEO_FRAMES = 12;

function validateLanguage(language?: string) {
  if (!language) return undefined;
  return VISION_SUPPORTED_LANGUAGES.includes(language as never)
    ? language
    : undefined;
}

export async function parseVisionVideoFormData(
  req: NextApiRequest,
  maxSize = VISION_MAX_VIDEO_SIZE
): Promise<VisionVideoFormData> {
  return new Promise<VisionVideoFormData>((resolve, reject) => {
    const busboy = Busboy({
      headers: req.headers,
      limits: {
        fileSize: maxSize,
      },
    });

    const fields: { language?: string } = {};
    let fileBuffer: Buffer = Buffer.alloc(0);
    let mimeType: string | undefined;
    let rejected = false;

    const safeReject = (error: Error) => {
      if (!rejected) {
        rejected = true;
        reject(error);
      }
    };

    busboy.on("field", (name: string, value: string) => {
      if (name === "language") {
        fields.language = validateLanguage(value);
      }
    });

    busboy.on(
      "file",
      (
        name: string,
        file: NodeJS.ReadableStream,
        info: { mimeType: string }
      ) => {
        if (name !== "file") {
          file.resume();
          return;
        }

        mimeType = info?.mimeType;

        if (!mimeType?.startsWith("video/")) {
          safeReject(new Error("Please upload a valid video file (MP4, MOV)."));
          file.resume();
          return;
        }

        const chunks: Buffer[] = [];
        file.on("data", (chunk: Buffer) => {
          chunks.push(chunk);
        });

        file.on("end", () => {
          fileBuffer = Buffer.concat(chunks);
        });

        file.on("error", () => {
          safeReject(new Error("Error reading uploaded video."));
        });
      }
    );

    busboy.on("finish", () => {
      if (!rejected) {
        resolve({ fields, fileBuffer, mimeType });
      }
    });

    busboy.on("error", () => {
      safeReject(new Error("Error processing form data."));
    });

    req.pipe(busboy);
  });
}

const MAX_FRAME_SIZE = 10 * 1024 * 1024; // 10MB

interface FfmpegOptions {
  scaleWidth: number;
  quality: number;
}

async function runFfmpeg(
  inputPath: string,
  framePattern: string,
  maxFrames: number,
  options: FfmpegOptions,
  forceFirstFrame = false
) {
  if (!ffmpegPath) {
    throw new Error(
      "FFmpeg binary not found. Install ffmpeg-static to enable video processing."
    );
  }

  const filter = forceFirstFrame
    ? `select=eq(n\\,0),scale=${options.scaleWidth}:-1`
    : `fps=1,scale=${options.scaleWidth}:-1`;

  const args = [
    "-y",
    "-i",
    inputPath,
    "-vf",
    filter,
    "-q:v",
    String(options.quality),
    "-vframes",
    String(maxFrames),
    framePattern,
  ];

  await new Promise<void>((resolve, reject) => {
    const ffmpeg = spawn(ffmpegPath as string, args);
    let stderr = "";

    ffmpeg.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    ffmpeg.on("error", (error) => {
      reject(error);
    });

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `FFmpeg exited with code ${code}: ${stderr
              .split("\n")
              .slice(-4)
              .join(" ")}`
          )
        );
      }
    });
  });
}

function inferExtension(mimeType?: string) {
  if (!mimeType) return "";
  if (mimeType === "video/mp4") return ".mp4";
  if (mimeType === "video/quicktime") return ".mov";
  if (mimeType === "video/x-matroska") return ".mkv";
  if (mimeType === "video/webm") return ".webm";
  return "";
}

export async function extractFramesFromVideo(
  videoBuffer: Buffer,
  maxFrames = MAX_VIDEO_FRAMES,
  mimeType?: string
): Promise<Buffer[]> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "vision-video-"));
  const ext = inferExtension(mimeType) || ".mp4";
  const inputPath = path.join(tempDir, `input-video${ext}`);
  const framePattern = path.join(tempDir, "frame-%03d.jpg");
  const presets: FfmpegOptions[] = [
    { scaleWidth: 1280, quality: 3 },
    { scaleWidth: 1024, quality: 4 },
    { scaleWidth: 800, quality: 5 },
    { scaleWidth: 640, quality: 6 },
  ];

  try {
    await fs.writeFile(inputPath, videoBuffer);
    for (const preset of presets) {
      await runFfmpeg(inputPath, framePattern, maxFrames, preset);

      let files = (await fs.readdir(tempDir))
        .filter((file) => file.startsWith("frame-") && file.endsWith(".jpg"))
        .sort();

      if (files.length === 0) {
        await runFfmpeg(inputPath, framePattern, 1, preset, true);
        files = (await fs.readdir(tempDir))
          .filter((file) => file.startsWith("frame-") && file.endsWith(".jpg"))
          .sort();
      }

      const frames = await Promise.all(
        files.map((file) => fs.readFile(path.join(tempDir, file)))
      );

      if (frames.length === 0) {
        continue;
      }

      const maxFrameSize = Math.max(...frames.map((frame) => frame.length));
      if (maxFrameSize <= MAX_FRAME_SIZE) {
        return frames;
      }

      await Promise.all(
        files.map((file) => fs.rm(path.join(tempDir, file), { force: true }))
      );
    }

    throw new Error("Extracted frames exceed the 10MB limit. Use a smaller video.");
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

export function aggregateFrameText(frameTexts: string[]): string {
  const seen = new Set<string>();
  const orderedLines: string[] = [];

  frameTexts.forEach((text) => {
    cleanText(text)
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((line) => {
        if (!seen.has(line)) {
          seen.add(line);
          orderedLines.push(line);
        }
      });
  });

  return orderedLines.join("\n");
}
