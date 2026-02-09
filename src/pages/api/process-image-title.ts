import { NextApiRequest, NextApiResponse } from "next";
import Busboy from "busboy";
import { cleanText, extractSearchResults } from "@/lib/searchResults";
import { ApiResponse, OcrSpaceResponse } from "@/types/type";

export const config = {
  api: {
    bodyParser: false,
    responseLimit: "10mb",
  },
};

const API_KEY = process.env.OCR_SPACE_API_KEY || "";

// Configuration constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_LANGUAGES = ["jpn", "eng", "chi", "kor"];
const DEFAULT_LANGUAGE = "jpn";

interface ProcessedFile {
  fields: { language?: string };
  fileBuffer: Buffer;
}

async function processOCR(
  imageBuffer: Buffer,
  language: string,
  engine: "1" | "2"
): Promise<OcrSpaceResponse> {
  const base64Image = imageBuffer.toString("base64");

  const formData = new FormData();
  formData.append("base64Image", `data:image/jpeg;base64,${base64Image}`);
  formData.append("apikey", API_KEY);
  formData.append("language", language);
  formData.append("OCREngine", engine);
  formData.append("isOverlayRequired", "false");
  formData.append("scale", "true");
  formData.append("detectOrientation", "true");

  const response = await fetch("https://api.ocr.space/parse/image", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`OCR service temporarily unavailable. Please try again.`);
  }

  const result: OcrSpaceResponse = await response.json();
  return result;
}

function validateLanguage(language: string): string {
  return SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;
}

async function parseFormData(req: NextApiRequest): Promise<ProcessedFile> {
  return new Promise<ProcessedFile>((resolve, reject) => {
    const busboy = Busboy({
      headers: req.headers,
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
    });

    const fields: { language?: string } = {};
    let fileBuffer: Buffer = Buffer.alloc(0);

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
        const { mimeType } = info;

        if (name !== "file") {
          file.resume();
          return;
        }

        if (!mimeType?.startsWith("image/")) {
          reject(
            new Error("Please upload a valid image file (JPEG, PNG, etc.)")
          );
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
          reject(new Error("Error reading uploaded file"));
        });
      }
    );

    busboy.on("finish", () => {
      resolve({ fields, fileBuffer });
    });

    busboy.on("error", () => {
      reject(new Error("Error processing form data"));
    });

    req.pipe(busboy);
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Set CORS headers for cross-origin requests
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Validate request method
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({
      status: "error",
      message: "Method not allowed. Please use POST.",
    });
  }

  try {
    console.log("Starting image processing request...");

    // Parse form data
    const { fields, fileBuffer } = await parseFormData(req);

    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No image file provided. Please upload an image.",
      });
    }

    if (fileBuffer.length > MAX_FILE_SIZE) {
      return res.status(400).json({
        status: "error",
        message: "File size too large. Please upload an image under 10MB.",
      });
    }

    const language = fields.language || DEFAULT_LANGUAGE;
    console.log(`Processing image with language: ${language}`);

    // Process with OCR Engine 2 (primary)
    let ocrResult = await processOCR(fileBuffer, language, "2");
    console.log("Primary OCR processing completed");

    // Fallback to Engine 1 if primary fails
    if (
      ocrResult?.IsErroredOnProcessing ||
      ocrResult?.ErrorMessage?.[0]?.includes("Server busy")
    ) {
      console.log("Primary engine unavailable, using fallback engine...");
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Rate limiting
      ocrResult = await processOCR(fileBuffer, language, "1");
      console.log("Fallback OCR processing completed");
    }

    // Handle OCR errors
    if (ocrResult?.IsErroredOnProcessing) {
      const errorMessage =
        ocrResult?.ErrorMessage?.[0] || "OCR processing failed";
      console.error("OCR processing error:", errorMessage);

      return res.status(500).json({
        status: "error",
        message:
          "Unable to process image. Please try again with a clearer image.",
      });
    }

    // Extract and process text
    const rawText: string = ocrResult?.ParsedResults?.[0]?.ParsedText || "";

    if (!rawText || rawText.trim().length === 0) {
      return res.status(400).json({
        status: "error",
        message:
          "No text detected in the image. Please ensure the image contains clear text.",
      });
    }

    console.log(`OCR extracted ${rawText.length} characters`);

    const cleanedText = cleanText(rawText);
    const searchResults = extractSearchResults(cleanedText);

    console.log(
      `Request completed successfully: ${searchResults.length} search results extracted`
    );

    // Return successful response
    return res.status(200).json({
      status: "success",
      text: cleanedText,
      searchResults: searchResults,
      resultCount: searchResults.length,
      resultsCount: searchResults.length,
      rawText: rawText, // Included for debugging purposes
    });
  } catch (error: unknown) {
    console.error("Image processing error:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while processing your image.";

    // User-friendly error messages
    let userMessage = errorMessage;
    if (errorMessage.includes("temporarily unavailable")) {
      userMessage =
        "Service temporarily unavailable. Please try again shortly.";
    } else if (errorMessage.includes("valid image file")) {
      userMessage =
        "Invalid file type. Please upload a supported image format (JPEG, PNG, etc.).";
    } else if (errorMessage.includes("reading uploaded file")) {
      userMessage = "Error reading uploaded file. Please try again.";
    }

    return res.status(500).json({
      status: "error",
      message: userMessage,
    });
  }
}
