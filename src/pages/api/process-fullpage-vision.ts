import {
  DEFAULT_VISION_LANGUAGE,
  parseVisionFormData,
  runVisionOCR,
  VISION_MAX_FILE_SIZE,
} from "@/lib/googleVision";
import { ApiResponse } from "@/types/type";
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
    responseLimit: "10mb",
  },
};

function normalizeFullPageText(text: string): string {
  return text
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
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
    const { fields, fileBuffer } = await parseVisionFormData(req);

    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No image file provided. Please upload an image.",
      });
    }

    if (fileBuffer.length > VISION_MAX_FILE_SIZE) {
      return res.status(400).json({
        status: "error",
        message:
          "Image too large for Google Vision. Please upload a file under 4MB.",
      });
    }

    const language = fields.language || DEFAULT_VISION_LANGUAGE;

    const rawText = await runVisionOCR(
      fileBuffer,
      language,
      "DOCUMENT_TEXT_DETECTION"
    );
    const text = normalizeFullPageText(rawText);

    return res.status(200).json({
      status: "success",
      text,
      rawText,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while processing your image.";

    let userMessage = message;
    if (message.includes("not configured")) {
      userMessage =
        "Google Vision API key missing. Ask an admin to configure it.";
    } else if (message.includes("Vision API request failed")) {
      userMessage = "Vision API rejected the request. Please retry shortly.";
    }

    return res.status(500).json({
      status: "error",
      message: userMessage,
    });
  }
}
