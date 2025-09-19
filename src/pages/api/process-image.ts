import formidable from "formidable";
import fs from "fs";
import fetch from "node-fetch";
import sharp from "sharp";
import FormData from "form-data";
import type { NextApiRequest, NextApiResponse } from "next";
import type { IncomingMessage, ServerResponse } from "http";

export const config = {
  api: {
    bodyParser: false,
  },
};

const API_KEY = "K87899389288957";
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ status: "error", message: "Method not allowed" });
  }

  try {
    // ✅ Wrap formidable parsing in a Promise
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

    const formData = new FormData();
    formData.append("file", imageBuffer, {
      filename: "image.png",
      contentType: "image/png",
    });
    formData.append("apikey", API_KEY);
    formData.append("language", language[0]);
    formData.append("OCREngine", "2");

    const response = await fetch(URL, { method: "POST", body: formData });

    const result: OcrSpaceResponse =
      (await response.json()) as OcrSpaceResponse;

    if (result?.IsErroredOnProcessing) {
      return res.status(500).json({
        status: "error",
        message: result?.ErrorMessage?.[0] || "OCR processing error",
      });
    }

    const text: string = result?.ParsedResults?.[0]?.ParsedText || "";
    return res.status(200).json({ status: "success", text });
  } catch (error: unknown) {
    console.error("OCR API Error:", error);
    const message: string =
      error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ status: "error", message });
  }
}
