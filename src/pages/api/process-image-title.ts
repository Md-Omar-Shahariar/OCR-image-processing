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

interface SearchResult {
  title: string;
  url: string;
}

function extractSearchResults(text: string): SearchResult[] {
  console.log("Raw OCR text for analysis:", text);

  const results: SearchResult[] = [];
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  console.log("Cleaned lines:", lines);

  // Method 1: Look for URL patterns and pair with preceding text
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Enhanced URL detection
    const urlMatch = line.match(
      /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?(?:\/[^\s]*)?)/gi
    );

    if (urlMatch) {
      const url = urlMatch[0];
      console.log(`Found URL: ${url} at line ${i}`);

      // Look for title in previous lines
      let title = "";
      for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
        const potentialTitle = lines[j];
        // A good title should be meaningful text, not too short/long
        if (
          potentialTitle &&
          potentialTitle.length > 5 &&
          potentialTitle.length < 150 &&
          !potentialTitle.match(/https?:\/\//) &&
          !potentialTitle.match(
            /^(Q|广告|Sponsored|相关搜索|Related|Search|时间|找到)/
          ) &&
          !potentialTitle.match(/^[0-9\s\.-]+$/) &&
          !potentialTitle.includes("...")
        ) {
          title = potentialTitle;
          console.log(`Found title: "${title}" for URL: ${url}`);
          break;
        }
      }

      // If no title found in previous lines, try to extract from current line
      if (!title && line.length > url.length + 5) {
        title = line.replace(url, "").trim();
        // Clean up title (remove special characters from start/end)
        title = title.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "");
      }

      if (title && url) {
        results.push({
          title: title,
          url: url.startsWith("http") ? url : `https://${url}`,
        });
        console.log(`Added result: "${title}" -> ${url}`);
      }
    }
  }

  // Method 2: If no URLs found with method 1, try to identify search result patterns
  if (results.length === 0) {
    console.log("Trying alternative search result detection...");

    // Look for lines that look like titles followed by domain-like text
    for (let i = 0; i < lines.length - 1; i++) {
      const currentLine = lines[i];
      const nextLine = lines[i + 1];

      // Check if current line could be a title
      const isPotentialTitle =
        currentLine &&
        currentLine.length > 10 &&
        currentLine.length < 120 &&
        !currentLine.match(/https?:\/\//) &&
        !currentLine.match(/^(Q|广告|Sponsored|相关搜索)/) &&
        currentLine.split(" ").length >= 2; // At least 2 words

      // Check if next line could be a URL/domain
      const isPotentialUrl =
        nextLine &&
        (nextLine.match(/[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/) ||
          nextLine.match(/(https?|www)/i));

      if (isPotentialTitle && isPotentialUrl) {
        let url = nextLine;
        // If it doesn't start with http, try to format it as URL
        if (!url.startsWith("http")) {
          const domainMatch = url.match(/[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/);
          if (domainMatch) {
            url = `https://${domainMatch[0]}`;
          }
        }

        results.push({
          title: currentLine,
          url: url,
        });
        console.log(`Alternative result: "${currentLine}" -> ${url}`);
      }
    }
  }

  // Remove duplicates
  const uniqueResults = results.filter(
    (result, index, self) =>
      index ===
      self.findIndex((r) => r.title === result.title && r.url === result.url)
  );

  console.log(`Final results: ${uniqueResults.length} unique results found`);
  return uniqueResults;
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
    console.log("Engine 2 response received");

    // If Engine 2 fails or server busy
    if (
      result?.IsErroredOnProcessing ||
      result?.ErrorMessage?.[0]?.includes("Server busy")
    ) {
      console.warn("Engine 2 failed or busy. Retrying Engine 1...");
      await new Promise((r) => setTimeout(r, 1000));
      result = await processOCR(imageBuffer, language[0], "1");
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
    console.error("OCR API Error:", error);
    const message: string =
      error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ status: "error", message });
  }
}
