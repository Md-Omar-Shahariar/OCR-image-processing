import formidable from "formidable";
import fs from "fs";
import fetch from "node-fetch";
import sharp from "sharp";
import FormData from "form-data";
import type { NextApiRequest, NextApiResponse } from "next";
import type { IncomingMessage } from "http";

export const config = {
  api: { bodyParser: false },
};

const API_KEY = process.env.OCR_SPACE_API_KEY || "";
const URL = "https://api.ocr.space/parse/image";
const MAX_SIZE = 2000;
const CONTRAST = 2;

interface OcrSpaceParsedResult {
  ParsedText?: string;
}

interface OcrSpaceResponse {
  IsErroredOnProcessing?: boolean;
  ErrorMessage?: string[];
  ParsedResults?: OcrSpaceParsedResult[];
}

async function processOCR(
  imageBuffer: Buffer,
  language: string,
  engine: "1" | "2"
) {
  const formData = new FormData();
  formData.append("file", imageBuffer, {
    filename: "image.png",
    contentType: "image/png",
  });
  formData.append("apikey", API_KEY);
  formData.append("language", language);
  formData.append("OCREngine", engine);

  const response = await fetch(URL, { method: "POST", body: formData });
  const result: OcrSpaceResponse = (await response.json()) as OcrSpaceResponse;
  return result;
}

function cleanSearchQueries(text: string): string {
  return (
    text
      // Split into lines
      .split("\n")
      // Process each line individually
      .map((line) =>
        line
          // Remove Q characters and any following punctuation/spaces
          .replace(/Q[ ,、]?\s*/g, "")
          // Normalize multiple spaces to single spaces
          .replace(/\s+/g, " ")
          // Trim leading/trailing spaces
          .trim()
      )
      // Remove empty lines
      .filter((line) => line.length > 0)
      // Join back with newlines
      .join("\n")
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ status: "error", message: "Method not allowed" });
  }

  try {
    const { fields, files } = await new Promise<{
      fields: formidable.Fields;
      files: formidable.Files;
    }>((resolve, reject) => {
      const form = formidable();
      form.parse(req as IncomingMessage, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const language: string[] = Array.isArray(fields.language)
      ? fields.language
      : [fields.language ?? "jpn"];

    if (!files.file || !Array.isArray(files.file) || !files.file[0]) {
      return res
        .status(400)
        .json({ status: "error", message: "No file uploaded." });
    }

    const filePath: string = files.file[0].filepath;
    let imageBuffer: Buffer = fs.readFileSync(filePath);

    // Preprocess image
    imageBuffer = await sharp(imageBuffer)
      .resize({ width: MAX_SIZE, height: MAX_SIZE, fit: "inside" })
      .grayscale()
      .modulate({ brightness: 1, saturation: CONTRAST })
      .png()
      .toBuffer();

    // Try Engine 2 first
    let result = await processOCR(imageBuffer, language[0], "2");
    console.log("Engine 2 response:", result);

    // If Engine 2 fails or server busy
    if (
      result?.IsErroredOnProcessing ||
      result?.ErrorMessage?.[0]?.includes("Server busy")
    ) {
      console.warn(
        "Engine 2 failed or busy. Retrying Engine 1 in 1 seconds..."
      );
      await new Promise((r) => setTimeout(r, 1000));
      result = await processOCR(imageBuffer, language[0], "1");
      console.log("Engine 1 response:", result);
    }

    if (result?.IsErroredOnProcessing) {
      return res.status(500).json({
        status: "error",
        message: result?.ErrorMessage?.[0] || "OCR processing error",
      });
    }

    const rawText: string = result?.ParsedResults?.[0]?.ParsedText || "";
    const cleanedText = cleanSearchQueries(rawText);

    return res.status(200).json({
      status: "success",
      text: cleanedText,
    });
  } catch (error: unknown) {
    console.error("OCR API Error:", error);
    const message: string =
      error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ status: "error", message });
  }
}
