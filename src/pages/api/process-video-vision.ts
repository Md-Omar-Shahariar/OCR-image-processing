import { resolveVisionLanguage, runVisionOCR } from "@/lib/googleVision";
import { cleanText } from "@/lib/searchResults";
import {
  aggregateFrameText,
  extractFramesFromVideo,
  parseVisionVideoFormData,
  VISION_MAX_VIDEO_SIZE,
} from "@/lib/videoVision";
import { FrameOcrResult, VideoOcrResponse } from "@/types/type";
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
    responseLimit: "12mb",
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VideoOcrResponse>
) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({
      status: "error",
      message: "Method not allowed. Please use POST.",
    });
  }

  try {
    const { fields, fileBuffer } = await parseVisionVideoFormData(req);

    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No video file provided. Please upload a video.",
      });
    }

    if (fileBuffer.length > VISION_MAX_VIDEO_SIZE) {
      return res.status(400).json({
        status: "error",
        message: "Video too large. Please upload a file under 50MB.",
      });
    }

    const language = resolveVisionLanguage(fields.language);
    const frames = await extractFramesFromVideo(fileBuffer);

    const frameResults: FrameOcrResult[] = [];
    for (const frame of frames) {
      const rawText = await runVisionOCR(frame, language, "DOCUMENT_TEXT_DETECTION");
      const text = cleanText(rawText);
      frameResults.push({
        index: frameResults.length + 1,
        text,
        rawText,
      });
    }

    const aggregateText = aggregateFrameText(frameResults.map((frame) => frame.text));

    return res.status(200).json({
      status: "success",
      aggregateText,
      framesProcessed: frameResults.length,
      frames: frameResults,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while processing your video.";

    let statusCode = 500;
    let userMessage = message;

    if (message.includes("valid video file") || message.includes("No frames")) {
      statusCode = 400;
    }

    if (message.includes("FFmpeg")) {
      userMessage =
        "Video processing failed. Ensure ffmpeg-static is installed and try again.";
    } else if (message.includes("Vision API request failed")) {
      userMessage = "Vision API rejected the request. Please retry shortly.";
    }

    return res.status(statusCode).json({
      status: "error",
      message: userMessage,
    });
  }
}
