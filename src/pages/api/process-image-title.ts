// pages/api/process-image-title.ts
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

async function processOCR(
  imageBuffer: Buffer,
  language: string,
  engine: "1" | "2"
): Promise<OcrSpaceResponse> {
  // Convert to base64 for OCR.space API

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
    throw new Error(`OCR API error: ${response.status} ${response.statusText}`);
  }

  const result: OcrSpaceResponse = await response.json();
  return result;
}

function extractSearchResults(text: string): SearchResult[] {
  console.log("Raw OCR text for analysis:", text);

  const results: SearchResult[] = [];
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  console.log("Cleaned lines:", lines);
  let flag = false;
  // Look for URL patterns and extract title + description
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Enhanced URL detection
    console.log(line, "Line.............................");
    const urlMatch = line.match(
      /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?(?:\/[^\s]*)?)/gi
    );
    if (urlMatch) {
      const find = line.split(" ");
      const findIndex = find.findIndex((part) => {
        return part.includes(urlMatch[0]);
      });
      if (findIndex > 0) {
        flag = false;
      } else {
        flag = true;
      }
      console.log(findIndex, "Index");
      console.log(find, "find'''''''''''''''''''");
    }

    // const urlMatch = extractCleanUrls(line);
    // if (urlMatch && find !== null ) {
    //   const textBeforeUrl = line.substring(0, find);

    //   // Check if there are ANY characters that are NOT spaces
    //   const hasAnyNonSpaceCharacters = /[^\s]/.test(textBeforeUrl);

    //   console.log(`Text before URL: "${textBeforeUrl}"`);
    //   console.log(`Has any non-space characters: ${hasAnyNonSpaceCharacters}`);
    //   console.log(
    //     `Characters before:`,
    //     Array.from(textBeforeUrl).map((c) =>
    //       c === " " ? "[space]" : c === "\t" ? "[tab]" : c
    //     )
    //   );

    //   // Only proceed if ONLY spaces (or nothing) before the URL
    //   if (!hasAnyNonSpaceCharacters) {
    //     const url = urlMatch[0];
    //     flag = true;
    //     console.log(`✅ Valid URL: ${url}`);
    //     // Continue with your processing...
    //   } else {
    //     console.log(`❌ Rejected: Non-space characters found before URL`);
    //   }
    // }

    if (urlMatch && flag) {
      console.log(urlMatch, "MATCH........................");
      const url = urlMatch[0];
      console.log(`Found URL: ${url} at line ${i}`);

      let title = "";
      let description = "";

      // Use the line immediately after URL as title (SIMPLIFIED LOGIC)
      if (i + 1 < lines.length) {
        const potentialTitle = lines[i + 1];

        // MUCH SIMPLER TITLE DETECTION - just check it's not another URL
        if (
          potentialTitle &&
          potentialTitle.length > 2 && // Shorter minimum for Japanese
          potentialTitle.length < 300 && // Longer maximum for Japanese titles
          !potentialTitle.match(/https?:\/\//) && // Only exclude URLs
          !potentialTitle.match(/^[0-9\s\.-]+$/) && // Exclude pure numbers
          flag
        ) {
          title = potentialTitle;
          console.log(`Found title: "${title}"`);

          // Use the next two lines after title as description
          const descriptionLines: string[] = [];

          // Get line 1 after title (i + 2)
          if (i + 2 < lines.length) {
            const descLine1 = lines[i + 2];
            if (
              descLine1 &&
              descLine1.length > 3 &&
              !descLine1.match(/https?:\/\//)
            ) {
              descriptionLines.push(descLine1);
            }
          }

          // Get line 2 after title (i + 3)
          if (i + 3 < lines.length) {
            const descLine2 = lines[i + 3];
            if (
              descLine2 &&
              descLine2.length > 3 &&
              !descLine2.match(/https?:\/\//)
            ) {
              descriptionLines.push(descLine2);
            }
          }

          // Combine the two lines into description
          if (descriptionLines.length > 0) {
            description = descriptionLines.join(" ");
            console.log(
              `Found description (${descriptionLines.length} lines): "${description}"`
            );
          }
        } else {
          console.log(
            `Skipped potential title: "${potentialTitle}" - didn't meet criteria`
          );
        }
      }

      // Clean up the title and description (gentle cleaning)
      if (title) {
        title = title
          .replace(/^[●•▪▫○◙◘►▼▲\s]+/, "")
          .replace(/[●•▪▫○◙◘►▼▲\s]+$/, "")
          .trim();
      }

      if (description) {
        description = description
          .replace(/^[●•▪▫○◙◘►▼▲\s]+/, "")
          .replace(/[●•▪▫○◙◘►▼▲\s]+$/, "")
          .trim();
      }

      // Add result if we have title and URL
      if (title && url) {
        results.push({
          title: title,
          url: url.startsWith("http") ? url : `https://${url}`,
          description: description || undefined,
        });
        console.log(`✅ Added result: "${title}" -> ${url}`);
      } else if (url) {
        console.log(`❌ No suitable title found for URL: ${url}`);
      }
    }
  }

  // Remove duplicates based on URL
  const uniqueResults = results.filter(
    (result, index, self) =>
      index === self.findIndex((r) => r.url === result.url)
  );

  console.log(`Final results: ${uniqueResults.length} unique results found`);
  return results;
}
function cleanText(text: string): string {
  return text
    .split("\n")
    .map((line) =>
      line
        // Remove Q characters and numbering
        .replace(/^Q[ ,、]?\s*\d*[.:]?\s*/g, "")
        // Remove common OCR artifacts
        .replace(/[●•▪▫○◙◘►▼▲]/g, "")
        // Remove excessive punctuation
        .replace(/[!?]{2,}/g, "")
        // Normalize spaces
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter((line) => line.length > 0)
    .join("\n");
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

    // Try Engine 2 first (no image preprocessing)
    let result = await processOCR(fileBuffer, language, "2");
    console.log("Engine 2 response received");

    // If Engine 2 fails or server busy
    if (
      result?.IsErroredOnProcessing ||
      result?.ErrorMessage?.[0]?.includes("Server busy")
    ) {
      console.warn("Engine 2 failed or busy. Retrying Engine 1...");
      await new Promise((r) => setTimeout(r, 1000));
      result = await processOCR(fileBuffer, language, "1");
      console.log("Engine 1 response received");
    }

    if (result?.IsErroredOnProcessing) {
      return res.status(500).json({
        status: "error",
        message: result?.ErrorMessage?.[0] || "OCR processing error",
      });
    }

    const rawText: string = result?.ParsedResults?.[0]?.ParsedText || "";
    console.log("Raw OCR text length:", rawText.length);

    const cleanedText = cleanText(rawText);
    const searchResults = extractSearchResults(cleanedText);

    console.log(`Processing complete: ${searchResults.length} results found`);

    return res.status(200).json({
      status: "success",
      text: cleanedText,
      searchResults: searchResults,
      resultsCount: searchResults.length,
      rawText: rawText, // Include for debugging
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
