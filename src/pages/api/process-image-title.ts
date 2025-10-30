import { NextApiRequest, NextApiResponse } from "next";
import Busboy from "busboy";
import { ApiResponse, OcrSpaceResponse, SearchResult } from "@/types/type";

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

function extractSearchResults(text: string): SearchResult[] {
  console.log("Processing OCR text for URL extraction");

  const results: SearchResult[] = [];
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  console.log(`Analyzing ${lines.length} text lines`);

  let isUrlLine = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Enhanced URL detection with validation
    const urlMatch = line.match(
      /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?(?:\/[^\s]*)?)/gi
    );

    if (urlMatch) {
      const lineParts = line.split(" ");
      const urlIndex = lineParts.findIndex((part) =>
        part.includes(urlMatch[0])
      );

      // URL is considered valid if it appears at the beginning of the line
      isUrlLine = urlIndex === 0;

      if (isUrlLine) {
        const url = urlMatch[0];
        console.log(`Detected URL: ${url}`);

        let title = "";
        let description = "";

        // Extract title from the following line
        if (i + 1 < lines.length) {
          const potentialTitle = lines[i + 1];

          // Validate potential title
          if (
            potentialTitle &&
            potentialTitle.length >= 2 &&
            potentialTitle.length < 300 &&
            !potentialTitle.match(/https?:\/\//) &&
            !potentialTitle.match(/^[0-9\s\.-]+$/)
          ) {
            title = potentialTitle;
            console.log(`Extracted title: "${title}"`);

            // Extract description from subsequent lines
            const descriptionLines: string[] = [];

            for (let j = i + 2; j <= i + 3 && j < lines.length; j++) {
              const descLine = lines[j];
              if (
                descLine &&
                descLine.length > 3 &&
                !descLine.match(/https?:\/\//)
              ) {
                descriptionLines.push(descLine);
              }
            }

            if (descriptionLines.length > 0) {
              description = descriptionLines.join(" ");
              console.log(`Extracted description: "${description}"`);
            }
          }
        }

        // Clean and validate extracted content
        title = title
          .replace(/^[●•▪▫○◙◘►▼▲\s]+/, "")
          .replace(/[●•▪▫○◙◘►▼▲\s]+$/, "")
          .trim();

        description = description
          .replace(/^[●•▪▫○◙◘►▼▲\s]+/, "")
          .replace(/[●•▪▫○◙◘►▼▲\s]+$/, "")
          .trim();

        // Add to results if we have valid title and URL
        if (title && url) {
          const fullUrl = url.startsWith("http") ? url : `https://${url}`;

          results.push({
            title: title,
            url: fullUrl,
            description: description || undefined,
          });

          console.log(`✅ Successfully processed: "${title}" -> ${fullUrl}`);
        }
      }
    }
  }

  // Remove duplicate URLs
  const uniqueResults = results.filter(
    (result, index, self) =>
      index === self.findIndex((r) => r.url === result.url)
  );

  console.log(
    `Processing complete: ${uniqueResults.length} unique results found`
  );
  return results;
}

function cleanText(text: string): string {
  return text
    .split("\n")
    .map((line) =>
      line
        .replace(/^Q[ ,、]?\s*\d*[.:]?\s*/g, "")
        .replace(/[●•▪▫○◙◘►▼▲]/g, "")
        .replace(/[!?]{2,}/g, "")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter((line) => line.length > 0)
    .join("\n");
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

        file.on("error", (error: Error) => {
          reject(new Error("Error reading uploaded file"));
        });
      }
    );

    busboy.on("finish", () => {
      resolve({ fields, fileBuffer });
    });

    busboy.on("error", (error: Error) => {
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
