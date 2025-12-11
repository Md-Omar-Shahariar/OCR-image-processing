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

async function runFfmpeg(inputPath: string, framePattern: string, maxFrames: number) {
  if (!ffmpegPath) {
    throw new Error(
      "FFmpeg binary not found. Install ffmpeg-static to enable video processing."
    );
  }

  const args = [
    "-y",
    "-i",
    inputPath,
    "-vf",
    `fps=1,scale=1280:-1`,
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

export async function extractFramesFromVideo(
  videoBuffer: Buffer,
  maxFrames = MAX_VIDEO_FRAMES
): Promise<Buffer[]> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "vision-video-"));
  const inputPath = path.join(tempDir, "input-video");
  const framePattern = path.join(tempDir, "frame-%03d.png");

  try {
    await fs.writeFile(inputPath, videoBuffer);
    await runFfmpeg(inputPath, framePattern, maxFrames);

    const files = (await fs.readdir(tempDir))
      .filter((file) => file.startsWith("frame-") && file.endsWith(".png"))
      .sort();

    const frames = await Promise.all(
      files.map((file) => fs.readFile(path.join(tempDir, file)))
    );

    if (frames.length === 0) {
      throw new Error("No frames were extracted from the uploaded video.");
    }

    return frames;
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
