// pages/api/process-image.ts
import { NextApiRequest, NextApiResponse } from "next";
import Busboy from "busboy";

export const config = {
  api: {
    bodyParser: false,
    responseLimit: "10mb",
  },
};

const API_KEY = process.env.OCR_SPACE_API_KEY || "";

interface ApiResponse {
  status: "success" | "error";
  text?: string;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({
      status: "error",
      message: `Method ${req.method} Not Allowed`,
    });
  }

  try {
    const { fields, fileBuffer } = await new Promise<{
      fields: { language?: string };
      fileBuffer: Buffer;
    }>((resolve, reject) => {
      const busboy = Busboy({
        headers: req.headers,
        limits: {
          fileSize: 10 * 1024 * 1024, // 10MB limit
        },
      });

      const fields: { language?: string } = {};
      let fileBuffer: Buffer = Buffer.alloc(0);

      busboy.on("field", (name: string, value: string) => {
        if (name === "language") {
          fields.language = value;
        }
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      busboy.on("file", (name: string, file: any, info: any) => {
        const { mimeType } = info;

        if (name !== "file") {
          file.resume();
          return;
        }

        if (!mimeType?.startsWith("image/")) {
          reject(new Error("Invalid file type. Please upload an image."));
          return;
        }

        const chunks: Buffer[] = [];
        file.on("data", (chunk: Buffer) => {
          chunks.push(chunk);
        });

        file.on("end", () => {
          fileBuffer = Buffer.concat(chunks);
        });

        file.on("error", (error: Error) => {
          reject(error);
        });
      });

      busboy.on("finish", () => {
        resolve({ fields, fileBuffer });
      });

      busboy.on("error", (error: Error) => {
        reject(error);
      });

      req.on("error", (error: Error) => {
        reject(error);
      });

      req.pipe(busboy);
    });

    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No file uploaded or file is empty.",
      });
    }

    const language = fields.language || "jpn";

    // Convert buffer to base64 for OCR.space
    const base64Image = fileBuffer.toString("base64");

    const formData = new FormData();
    formData.append("base64Image", `data:image/jpeg;base64,${base64Image}`);
    formData.append("apikey", API_KEY);
    formData.append("language", language);
    formData.append("OCREngine", "2");
    formData.append("isOverlayRequired", "false");
    formData.append("scale", "true");

    const ocrResponse = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: formData,
    });

    if (!ocrResponse.ok) {
      throw new Error(`OCR API error: ${ocrResponse.status}`);
    }

    const ocrResult = await ocrResponse.json();

    if (ocrResult.IsErroredOnProcessing) {
      return res.status(500).json({
        status: "error",
        message: ocrResult.ErrorMessage?.[0] || "OCR processing failed",
      });
    }

    const rawText: string = ocrResult.ParsedResults?.[0]?.ParsedText || "";

    // Simple text cleaning
    const cleanedText = rawText
      .split("\n")
      .map((line) =>
        line
          .replace(/Q[ ,、]?\s*/g, "")
          .replace(/\s+/g, " ")
          .trim()
      )
      .filter((line) => line.length > 0)
      .join("\n");

    return res.status(200).json({
      status: "success",
      text: cleanedText,
    });
  } catch (error: unknown) {
    console.error("API Error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";

    return res.status(500).json({
      status: "error",
      message: message,
    });
  }
}
