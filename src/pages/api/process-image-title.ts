// pages/api/process-image-title.ts
import { NextApiRequest, NextApiResponse } from "next";
import Busboy from "busboy";

export const config = {
  api: {
    bodyParser: false,
    responseLimit: "10mb",
  },
};

const API_KEY = process.env.OCR_SPACE_API_KEY || "";

interface OcrSpaceParsedResult {
  ParsedText?: string;
}

interface OcrSpaceResponse {
  IsErroredOnProcessing?: boolean;
  ErrorMessage?: string[];
  ParsedResults?: OcrSpaceParsedResult[];
}

interface ApiResponse {
  status: "success" | "error";
  text?: string;
  searchResults?: SearchResult[];
  resultsCount?: number;
  rawText?: string;
  message?: string;
}

interface SearchResult {
  title: string;
  url: string;
  description?: string;
}

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

// function extractSearchResults(text: string): SearchResult[] {
//   console.log("Raw OCR text for analysis:", text);

//   const results: SearchResult[] = [];
//   const lines = text
//     .split("\n")
//     .map((line) => line.trim())
//     .filter((line) => line.length > 0);

//   console.log("Cleaned lines:", lines);

//   // Method 1: Look for URL patterns and pair with preceding text
//   for (let i = 0; i < lines.length; i++) {
//     const line = lines[i];

//     // Enhanced URL detection
//     const urlMatch = line.match(
//       /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?(?:\/[^\s]*)?)/gi
//     );

//     if (urlMatch) {
//       const url = urlMatch[0];
//       console.log(`Found URL: ${url} at line ${i}`);

//       // Look for title in previous lines
//       let title = "";
//       for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
//         const potentialTitle = lines[j];
//         // A good title should be meaningful text, not too short/long
//         if (
//           potentialTitle &&
//           potentialTitle.length > 5 &&
//           potentialTitle.length < 150 &&
//           !potentialTitle.match(/https?:\/\//) &&
//           !potentialTitle.match(
//             /^(Q|广告|Sponsored|相关搜索|Related|Search|时间|找到)/
//           ) &&
//           !potentialTitle.match(/^[0-9\s\.-]+$/) &&
//           !potentialTitle.includes("...")
//         ) {
//           title = potentialTitle;
//           console.log(`Found title: "${title}" for URL: ${url}`);
//           break;
//         }
//       }

//       // If no title found in previous lines, try to extract from current line
//       if (!title && line.length > url.length + 5) {
//         title = line.replace(url, "").trim();
//         // Clean up title (remove special characters from start/end)
//         title = title.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "");
//       }

//       if (title && url) {
//         results.push({
//           title: title,
//           url: url.startsWith("http") ? url : `https://${url}`,
//         });
//         console.log(`Added result: "${title}" -> ${url}`);
//       }
//     }
//   }

//   // Method 2: If no URLs found with method 1, try to identify search result patterns
//   if (results.length === 0) {
//     console.log("Trying alternative search result detection...");

//     // Look for lines that look like titles followed by domain-like text
//     for (let i = 0; i < lines.length - 1; i++) {
//       const currentLine = lines[i];
//       const nextLine = lines[i + 1];

//       // Check if current line could be a title
//       const isPotentialTitle =
//         currentLine &&
//         currentLine.length > 10 &&
//         currentLine.length < 120 &&
//         !currentLine.match(/https?:\/\//) &&
//         !currentLine.match(/^(Q|广告|Sponsored|相关搜索)/) &&
//         currentLine.split(" ").length >= 2; // At least 2 words

//       // Check if next line could be a URL/domain
//       const isPotentialUrl =
//         nextLine &&
//         (nextLine.match(/[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/) ||
//           nextLine.match(/(https?|www)/i));

//       if (isPotentialTitle && isPotentialUrl) {
//         let url = nextLine;
//         // If it doesn't start with http, try to format it as URL
//         if (!url.startsWith("http")) {
//           const domainMatch = url.match(/[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/);
//           if (domainMatch) {
//             url = `https://${domainMatch[0]}`;
//           }
//         }

//         results.push({
//           title: currentLine,
//           url: url,
//         });
//         console.log(`Alternative result: "${currentLine}" -> ${url}`);
//       }
//     }
//   }

//   // Remove duplicates
//   const uniqueResults = results.filter(
//     (result, index, self) =>
//       index ===
//       self.findIndex((r) => r.title === result.title && r.url === result.url)
//   );

//   console.log(`Final results: ${uniqueResults.length} unique results found`);
//   return uniqueResults;
// }
// function extractSearchResults(text: string): SearchResult[] {
//   console.log("Raw OCR text for analysis:", text);

//   const results: SearchResult[] = [];
//   const lines = text
//     .split("\n")
//     .map((line) => line.trim())
//     .filter((line) => line.length > 0);

//   console.log("Cleaned lines:", lines);

//   // Method 1: Look for URL patterns and pair with preceding text as title
//   for (let i = 0; i < lines.length; i++) {
//     const line = lines[i];

//     // Enhanced URL detection - match various URL formats
//     const urlMatch = line.match(
//       /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?(?:\/[^\s]*)?)/gi
//     );

//     if (urlMatch) {
//       const url = urlMatch[0];
//       console.log(`Found URL: ${url} at line ${i}`);

//       // Look for title in previous lines (red-marked titles typically appear before URLs)
//       let title = "";

//       // Search up to 3 lines back for the title
//       for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
//         const potentialTitle = lines[j];

//         // Criteria for what constitutes a good title (red-marked text)
//         if (
//           potentialTitle &&
//           potentialTitle.length > 3 && // Shorter minimum for Japanese titles
//           potentialTitle.length < 200 &&
//           !potentialTitle.match(/https?:\/\//) &&
//           !potentialTitle.match(
//             /^(Q|广告|Sponsored|相关搜索|Related|Search|时间|找到|ページ|Page|\d+)/
//           ) &&
//           !potentialTitle.match(/^[0-9\s\.-]+$/) &&
//           !potentialTitle.includes("...") &&
//           // Additional criteria for Japanese/English titles
//           (potentialTitle.match(/[a-zA-Z]/) ||
//             potentialTitle.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/)) // Contains letters or Japanese characters
//         ) {
//           title = potentialTitle;
//           console.log(`Found title: "${title}" for URL: ${url}`);
//           break;
//         }
//       }

//       // If no title found in previous lines, try to extract from current line
//       if (!title && line.length > url.length + 5) {
//         title = line.replace(url, "").trim();
//         // Clean up title (remove special characters from start/end)
//         title = title.replace(
//           /^[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+|[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+$/g,
//           ""
//         );
//       }

//       // Final title cleanup
//       if (title) {
//         // Remove common prefixes/suffixes that might be OCR artifacts
//         title = title
//           .replace(/^[●•▪▫○◙◘►▼▲\s]+/, "")
//           .replace(/[●•▪▫○◙◘►▼▲\s]+$/, "")
//           .trim();
//       }

//       if (title && url) {
//         results.push({
//           title: title,
//           url: url.startsWith("http") ? url : `https://${url}`,
//         });
//         console.log(`Added result: "${title}" -> ${url}`);
//       }
//     }
//   }

//   // Method 2: Pattern matching for search result structure
//   if (results.length === 0) {
//     console.log("Trying alternative search result detection...");

//     // Look for lines that look like titles followed by URL-like text
//     for (let i = 0; i < lines.length - 1; i++) {
//       const currentLine = lines[i];
//       const nextLine = lines[i + 1];

//       // Check if current line could be a title (red-marked)
//       const isPotentialTitle =
//         currentLine &&
//         currentLine.length > 2 && // Even shorter for Japanese
//         currentLine.length < 150 &&
//         !currentLine.match(/https?:\/\//) &&
//         !currentLine.match(/^(Q|广告|Sponsored|相关搜索|ページ|Page|\d+)/) &&
//         (currentLine.match(/[a-zA-Z]/) ||
//           currentLine.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/)) && // Contains text
//         currentLine.split(/\s+/).length >= 1; // At least 1 "word"

//       // Check if next line could be a URL/domain
//       const isPotentialUrl =
//         nextLine &&
//         (nextLine.match(/[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/) ||
//           nextLine.match(/(https?|www)/i));

//       if (isPotentialTitle && isPotentialUrl) {
//         let url = nextLine;
//         // If it doesn't start with http, try to format it as URL
//         if (!url.startsWith("http")) {
//           const domainMatch = url.match(/[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/);
//           if (domainMatch) {
//             url = `https://${domainMatch[0]}`;
//           }
//         }

//         const title = currentLine
//           .replace(/^[●•▪▫○◙◘►▼▲\s]+/, "")
//           .replace(/[●•▪▫○◙◘►▼▲\s]+$/, "")
//           .trim();

//         if (title && url) {
//           results.push({
//             title: title,
//             url: url,
//           });
//           console.log(`Alternative result: "${title}" -> ${url}`);
//         }
//       }
//     }
//   }

//   // Method 3: Handle Japanese-specific patterns
//   if (results.length === 0) {
//     console.log("Trying Japanese-specific pattern detection...");

//     // Look for Japanese text patterns that indicate titles
//     for (let i = 0; i < lines.length; i++) {
//       const line = lines[i];

//       // Check if line contains Japanese characters and looks like a title
//       const hasJapanese = line.match(
//         /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/
//       );
//       const hasUrl = line.match(
//         /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/
//       );

//       if (hasJapanese && hasUrl) {
//         const urlMatch = line.match(
//           /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/
//         );
//         if (urlMatch) {
//           const url = urlMatch[0];
//           let title = line.replace(url, "").trim();

//           // Clean up the title
//           title = title
//             .replace(/^[●•▪▫○◙◘►▼▲\s\-–—]+/, "")
//             .replace(/[●•▪▫○◙◘►▼▲\s\-–—]+$/, "")
//             .trim();

//           if (title.length > 2) {
//             results.push({
//               title: title,
//               url: url.startsWith("http") ? url : `https://${url}`,
//             });
//             console.log(`Japanese pattern result: "${title}" -> ${url}`);
//           }
//         }
//       }
//     }
//   }

//   // Remove duplicates based on URL (same URL = same result)
//   const uniqueResults = results.filter(
//     (result, index, self) =>
//       index === self.findIndex((r) => r.url === result.url)
//   );

//   console.log(`Final results: ${uniqueResults.length} unique results found`);
//   return uniqueResults;
// }
// function extractSearchResults(text: string): SearchResult[] {
//   console.log("Raw OCR text for analysis:", text);

//   const results: SearchResult[] = [];
//   const lines = text
//     .split("\n")
//     .map((line) => line.trim())
//     .filter((line) => line.length > 0);

//   console.log("Cleaned lines:", lines);

//   // Method 1: Look for URL patterns and combine title + description
//   for (let i = 0; i < lines.length; i++) {
//     const line = lines[i];

//     // Enhanced URL detection
//     const urlMatch = line.match(
//       /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?(?:\/[^\s]*)?)/gi
//     );

//     if (urlMatch) {
//       const url = urlMatch[0];
//       console.log(`Found URL: ${url} at line ${i}`);

//       // Look for title in previous lines (red-marked text)
//       let title = "";
//       let description = "";

//       // Find the title (1-3 lines before URL)
//       for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
//         const potentialTitle = lines[j];

//         if (
//           potentialTitle &&
//           potentialTitle.length > 3 &&
//           potentialTitle.length < 200 &&
//           !potentialTitle.match(/https?:\/\//) &&
//           !potentialTitle.match(
//             /^(Q|广告|Sponsored|相关搜索|Related|Search|时间|找到|ページ|Page|\d+)/
//           ) &&
//           !potentialTitle.match(/^[0-9\s\.-]+$/) &&
//           !potentialTitle.includes("...") &&
//           (potentialTitle.match(/[a-zA-Z]/) ||
//             potentialTitle.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/))
//         ) {
//           title = potentialTitle;
//           console.log(`Found title: "${title}"`);
//           break;
//         }
//       }

//       // Find the description (line after URL)
//       if (i + 1 < lines.length) {
//         const potentialDesc = lines[i + 1];
//         // Description should be meaningful text, not too short
//         if (
//           potentialDesc &&
//           potentialDesc.length > 10 && // Longer minimum for descriptions
//           potentialDesc.length < 300 &&
//           !potentialDesc.match(/https?:\/\//) &&
//           !potentialDesc.match(
//             /^(Q|广告|Sponsored|相关搜索|Related|Search|時間|找到|ページ|Page)/
//           ) &&
//           (potentialDesc.match(/[a-zA-Z]/) ||
//             potentialDesc.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/))
//         ) {
//           description = potentialDesc;
//           console.log(`Found description: "${description}"`);
//         }
//       }

//       // Combine title and description for the full title
//       let fullTitle = title;
//       if (title && description) {
//         // fullTitle = `${title} - ${description}`;
//         fullTitle = `${description}`;
//       } else if (description) {
//         fullTitle = description; // Fallback if no title found
//       }

//       // Clean up the full title
//       if (fullTitle) {
//         fullTitle = fullTitle
//           .replace(/^[●•▪▫○◙◘►▼▲\s]+/, "")
//           .replace(/[●•▪▫○◙◘►▼▲\s]+$/, "")
//           .trim();
//       }

//       if (fullTitle && url) {
//         results.push({
//           title: fullTitle,
//           url: url.startsWith("http") ? url : `https://${url}`,
//         });
//         console.log(`Added result: "${fullTitle}" -> ${url}`);
//       }
//     }
//   }

//   // Method 2: Alternative pattern matching for search results
//   if (results.length === 0) {
//     console.log("Trying alternative search result detection...");

//     for (let i = 0; i < lines.length - 2; i++) {
//       const titleLine = lines[i];
//       const urlLine = lines[i + 1];
//       const descLine = lines[i + 2];

//       // Check if this looks like a search result pattern: Title -> URL -> Description
//       const isPotentialTitle =
//         titleLine &&
//         titleLine.length > 2 &&
//         titleLine.length < 150 &&
//         !titleLine.match(/https?:\/\//) &&
//         !titleLine.match(/^(Q|广告|Sponsored|相关搜索|ページ|Page|\d+)/) &&
//         (titleLine.match(/[a-zA-Z]/) ||
//           titleLine.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/));

//       const isPotentialUrl =
//         urlLine &&
//         (urlLine.match(/[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/) ||
//           urlLine.match(/(https?|www)/i));

//       const isPotentialDesc =
//         descLine &&
//         descLine.length > 10 &&
//         descLine.length < 300 &&
//         !descLine.match(/https?:\/\//) &&
//         !descLine.match(/^(Q|广告|Sponsored|相关搜索|Related|Search)/);

//       if (isPotentialTitle && isPotentialUrl && isPotentialDesc) {
//         let url = urlLine;
//         if (!url.startsWith("http")) {
//           const domainMatch = url.match(/[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/);
//           if (domainMatch) {
//             url = `https://${domainMatch[0]}`;
//           }
//         }

//         const fullTitle = `${titleLine} - ${descLine}`
//           .replace(/^[●•▪▫○◙◘►▼▲\s]+/, "")
//           .replace(/[●•▪▫○◙◘►▼▲\s]+$/, "")
//           .trim();

//         if (fullTitle && url) {
//           results.push({
//             title: fullTitle,
//             url: url,
//           });
//           console.log(`Alternative result: "${fullTitle}" -> ${url}`);
//         }
//       }
//     }
//   }

//   // Method 3: Handle cases where URL and description are in the same line
//   for (let i = 0; i < lines.length; i++) {
//     const line = lines[i];

//     const urlMatch = line.match(
//       /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?(?:\/[^\s]*)?)/gi
//     );

//     if (urlMatch) {
//       const url = urlMatch[0];
//       const lineWithoutUrl = line.replace(url, "").trim();

//       // If the line contains both URL and substantial text, use that text as description
//       if (lineWithoutUrl.length > 20) {
//         // Look for title in previous lines
//         let title = "";
//         for (let j = i - 1; j >= Math.max(0, i - 2); j--) {
//           const potentialTitle = lines[j];
//           if (
//             potentialTitle &&
//             potentialTitle.length > 3 &&
//             !potentialTitle.match(/https?:\/\//) &&
//             (potentialTitle.match(/[a-zA-Z]/) ||
//               potentialTitle.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/))
//           ) {
//             title = potentialTitle;
//             break;
//           }
//         }

//         const fullTitle = title
//           ? `${title} - ${lineWithoutUrl}`
//           : lineWithoutUrl;

//         if (!results.some((r) => r.url === url)) {
//           results.push({
//             title: fullTitle,
//             url: url.startsWith("http") ? url : `https://${url}`,
//           });
//           console.log(`Combined line result: "${fullTitle}" -> ${url}`);
//         }
//       }
//     }
//   }

//   // Remove duplicates based on URL
//   const uniqueResults = results.filter(
//     (result, index, self) =>
//       index === self.findIndex((r) => r.url === result.url)
//   );

//   console.log(`Final results: ${uniqueResults.length} unique results found`);
//   return uniqueResults;
// }

// function extractSearchResults(text: string): SearchResult[] {
//   console.log("Raw OCR text for analysis:", text);

//   const results: SearchResult[] = [];
//   const lines = text
//     .split("\n")
//     .map((line) => line.trim())
//     .filter((line) => line.length > 0);

//   console.log("Cleaned lines:", lines);

//   // Method 1: Look for URL patterns and extract complete content
//   for (let i = 0; i < lines.length; i++) {
//     const line = lines[i];

//     // Enhanced URL detection
//     const urlMatch = line.match(
//       /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?(?:\/[^\s]*)?)/gi
//     );

//     if (urlMatch) {
//       const url = urlMatch[0];
//       console.log(`Found URL: ${url} at line ${i}`);

//       // Look for title in previous lines (red-marked text)
//       let title = "";
//       let initialDescription = "";
//       let fullDescriptionLines: string[] = [];

//       // Find the title (1-3 lines before URL)
//       for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
//         const potentialTitle = lines[j];
//         if (
//           potentialTitle &&
//           potentialTitle.length > 3 &&
//           potentialTitle.length < 200 &&
//           !potentialTitle.match(/https?:\/\//) &&
//           !potentialTitle.match(
//             /^(Q|广告|Sponsored|相关搜索|Related|Search|时间|找到|ページ|Page|\d+)/
//           ) &&
//           !potentialTitle.match(/^[0-9\s\.-]+$/) &&
//           !potentialTitle.includes("...") &&
//           (potentialTitle.match(/[a-zA-Z]/) ||
//             potentialTitle.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/))
//         ) {
//           title = potentialTitle;
//           console.log(`Found title: "${title}"`);
//           break;
//         }
//       }

//       // Find the initial description (line immediately after URL)
//       if (i + 1 < lines.length) {
//         const potentialDesc = lines[i + 1];
//         if (
//           potentialDesc &&
//           potentialDesc.length > 10 &&
//           potentialDesc.length < 300 &&
//           !potentialDesc.match(/https?:\/\//) &&
//           !potentialDesc.match(
//             /^(Q|广告|Sponsored|相关搜索|Related|Search|時間|找到|ページ|Page)/
//           ) &&
//           (potentialDesc.match(/[a-zA-Z]/) ||
//             potentialDesc.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/))
//         ) {
//           initialDescription = potentialDesc;
//           console.log(`Found initial description: "${initialDescription}"`);
//         }
//       }

//       // Find the FULL description content (multiple lines after initial description)
//       if (i + 2 < lines.length) {
//         const paragraphLines: string[] = [];

//         // Start from line after initial description
//         const startIndex = i + 2;

//         // If we found initial description, include it as first line
//         // if (initialDescription) {
//         //   paragraphLines.push(initialDescription);
//         // }

//         // Collect consecutive lines that belong to this search result
//         for (let k = startIndex; k < Math.min(lines.length, i + 15); k++) {
//           const currentLine = lines[k];

//           // Stop conditions for paragraph collection:
//           // 1. If we hit another URL (new search result)
//           if (currentLine.match(/(https?:\/\/|www\.)/)) {
//             break;
//           }

//           // 2. If line is very short and looks like a new title/separator
//           if (
//             currentLine.length < 25 &&
//             currentLine.split(/\s+/).length < 4 &&
//             !currentLine.match(/[.,!?;:]$/)
//           ) {
//             // Check if next line is a URL (indicating new result)
//             if (
//               k + 1 < lines.length &&
//               lines[k + 1].match(/(https?:\/\/|www\.)/)
//             ) {
//               break;
//             }
//           }

//           // 3. If line looks like the start of a new search result title
//           if (
//             currentLine.length > 10 &&
//             currentLine.length < 100 &&
//             !currentLine.match(/[.,!?;:]$/) &&
//             k + 1 < lines.length &&
//             lines[k + 1].match(/(https?:\/\/|www\.)/)
//           ) {
//             break;
//           }

//           // Add line to paragraph if it has content
//           if (
//             currentLine.length > 5 &&
//             !currentLine.match(/^(Q|广告|Sponsored|相关搜索|Related|Search)/)
//           ) {
//             paragraphLines.push(currentLine);
//           } else {
//             // If line is too short and doesn't look like content, stop
//             break;
//           }
//         }

//         fullDescriptionLines = paragraphLines;
//       } else if (initialDescription) {
//         // If no additional lines but we have initial description, use that
//         fullDescriptionLines = [initialDescription];
//       }

//       // Combine title and initial description for the title field
//       let fullTitle = title;
//       if (title && initialDescription) {
//         fullTitle = `${initialDescription}`;
//       } else if (initialDescription) {
//         fullTitle = initialDescription;
//       }

//       // Create the full description from all collected lines
//       let fullDescription = "";
//       if (fullDescriptionLines.length > 0) {
//         fullDescription = fullDescriptionLines.join(" ");
//         console.log(
//           `Found full description (${
//             fullDescriptionLines.length
//           } lines): "${fullDescription.substring(0, 100)}..."`
//         );
//       }

//       // Clean up the titles and descriptions
//       if (fullTitle) {
//         fullTitle = fullTitle
//           .replace(/^[●•▪▫○◙◘►▼▲\s]+/, "")
//           .replace(/[●•▪▫○◙◘►▼▲\s]+$/, "")
//           .trim();
//       }

//       if (fullDescription) {
//         fullDescription = fullDescription
//           .replace(/^[●•▪▫○◙◘►▼▲\s]+/, "")
//           .replace(/[●•▪▫○◙◘►▼▲\s]+$/, "")
//           .trim();
//       }

//       if (fullTitle && url) {
//         results.push({
//           title: fullTitle,
//           url: url.startsWith("http") ? url : `https://${url}`,
//           description: fullDescription || undefined,
//         });
//         console.log(`Added result: "${fullTitle}" -> ${url}`);
//       }
//     }
//   }

//   // Method 2: Alternative approach for better content grouping
//   if (results.length === 0) {
//     console.log("Trying alternative content grouping method...");

//     // Group lines by search result segments
//     const segments: Array<{
//       title: string;
//       url: string;
//       descriptionLines: string[];
//     }> = [];
//     let currentSegment: {
//       title: string;
//       url: string;
//       descriptionLines: string[];
//     } | null = null;

//     for (let i = 0; i < lines.length; i++) {
//       const line = lines[i];

//       // Check if this line starts a new segment (contains URL or looks like title)
//       const urlMatch = line.match(
//         /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/
//       );
//       const looksLikeTitle =
//         line.length > 10 &&
//         line.length < 150 &&
//         !line.match(/https?:\/\//) &&
//         !line.match(/[.,!?;:]$/);

//       if (
//         urlMatch ||
//         (looksLikeTitle &&
//           i + 1 < lines.length &&
//           lines[i + 1].match(/(https?:\/\/|www\.)/))
//       ) {
//         // Save previous segment
//         if (currentSegment) {
//           segments.push(currentSegment);
//         }

//         // Start new segment
//         if (urlMatch) {
//           currentSegment = {
//             title: i > 0 ? lines[i - 1] : line,
//             url: urlMatch[0],
//             descriptionLines: [],
//           };
//         } else {
//           currentSegment = {
//             title: line,
//             url: lines[i + 1],
//             descriptionLines: [],
//           };
//           i++; // Skip the URL line
//         }
//       } else if (
//         currentSegment &&
//         line.length > 5 &&
//         !line.match(/https?:\/\//)
//       ) {
//         // Add to current segment's description
//         currentSegment.descriptionLines.push(line);
//       }
//     }

//     // Add the last segment
//     if (currentSegment) {
//       segments.push(currentSegment);
//     }

//     // Convert segments to results
//     for (const segment of segments) {
//       const fullDescription = segment.descriptionLines.join(" ").trim();

//       results.push({
//         title: segment.title,
//         url: segment.url.startsWith("http")
//           ? segment.url
//           : `https://${segment.url}`,
//         description: fullDescription || undefined,
//       });
//     }
//   }

//   // Remove duplicates based on URL
//   const uniqueResults = results.filter(
//     (result, index, self) =>
//       index === self.findIndex((r) => r.url === result.url)
//   );

//   console.log(`Final results: ${uniqueResults.length} unique results found`);
//   return uniqueResults;
// }
// function extractSearchResults(text: string): SearchResult[] {
//   console.log("Raw OCR text for analysis:", text);

//   const results: SearchResult[] = [];
//   const lines = text
//     .split("\n")
//     .map((line) => line.trim())
//     .filter((line) => line.length > 0);

//   console.log("Cleaned lines:", lines);

//   // Method 1: Look for URL patterns and extract complete content
//   for (let i = 0; i < lines.length; i++) {
//     const line = lines[i];

//     // Enhanced URL detection
//     const urlMatch = line.match(
//       /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?(?:\/[^\s]*)?)/gi
//     );

//     if (urlMatch) {
//       const url = urlMatch[0];
//       console.log(`Found URL: ${url} at line ${i}`);

//       // Look for title in previous lines (red-marked text)
//       let title = "";
//       let initialDescription = "";
//       let fullDescriptionLines: string[] = [];

//       // Find the title (1-3 lines before URL)
//       for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
//         const potentialTitle = lines[j];
//         if (
//           potentialTitle &&
//           potentialTitle.length > 3 &&
//           potentialTitle.length < 200 &&
//           !potentialTitle.match(/https?:\/\//) &&
//           !potentialTitle.match(
//             /^(Q|广告|Sponsored|相关搜索|Related|Search|时间|找到|ページ|Page|\d+)/
//           ) &&
//           !potentialTitle.match(/^[0-9\s\.-]+$/) &&
//           !potentialTitle.includes("...") &&
//           (potentialTitle.match(/[a-zA-Z]/) ||
//             potentialTitle.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/))
//         ) {
//           title = potentialTitle;
//           console.log(`Found title: "${title}"`);
//           break;
//         }
//       }

//       // Find the initial description (line immediately after URL)
//       if (i + 1 < lines.length) {
//         const potentialDesc = lines[i + 1];
//         if (
//           potentialDesc &&
//           potentialDesc.length > 10 &&
//           potentialDesc.length < 300 &&
//           !potentialDesc.match(/https?:\/\//) &&
//           !potentialDesc.match(
//             /^(Q|广告|Sponsored|相关搜索|Related|Search|時間|找到|ページ|Page)/
//           ) &&
//           (potentialDesc.match(/[a-zA-Z]/) ||
//             potentialDesc.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/))
//         ) {
//           initialDescription = potentialDesc;
//           console.log(`Found initial description: "${initialDescription}"`);
//         }
//       }

//       // Find the FULL description content (multiple lines after initial description)
//       if (i + 2 < lines.length) {
//         const paragraphLines: string[] = [];

//         // Start from line after initial description
//         const startIndex = i + 2;

//         // Collect consecutive lines that belong to this search result
//         for (let k = startIndex; k < Math.min(lines.length, i + 15); k++) {
//           const currentLine = lines[k];

//           // Stop conditions for paragraph collection:
//           // 1. If we hit another URL (new search result)
//           if (currentLine.match(/(https?:\/\/|www\.)/)) {
//             break;
//           }

//           // 2. If line is very short and looks like a new title/separator
//           if (
//             currentLine.length < 25 &&
//             currentLine.split(/\s+/).length < 4 &&
//             !currentLine.match(/[.,!?;:]$/)
//           ) {
//             // Check if next line is a URL (indicating new result)
//             if (
//               k + 1 < lines.length &&
//               lines[k + 1].match(/(https?:\/\/|www\.)/)
//             ) {
//               break;
//             }
//           }

//           // 3. If line looks like the start of a new search result title
//           if (
//             currentLine.length > 10 &&
//             currentLine.length < 100 &&
//             !currentLine.match(/[.,!?;:]$/) &&
//             k + 1 < lines.length &&
//             lines[k + 1].match(/(https?:\/\/|www\.)/)
//           ) {
//             break;
//           }

//           // Add line to paragraph if it has content
//           if (
//             currentLine.length > 5 &&
//             !currentLine.match(/^(Q|广告|Sponsored|相关搜索|Related|Search)/)
//           ) {
//             paragraphLines.push(currentLine);
//           } else {
//             // If line is too short and doesn't look like content, stop
//             break;
//           }
//         }

//         fullDescriptionLines = paragraphLines;
//       } else if (initialDescription) {
//         // If no additional lines but we have initial description, use that
//         fullDescriptionLines = [initialDescription];
//       }

//       // Combine title and initial description for the title field
//       let fullTitle = title;
//       if (title && initialDescription) {
//         fullTitle = `${initialDescription}`;
//       } else if (initialDescription) {
//         fullTitle = initialDescription;
//       }

//       // Create the full description from only the first two collected lines
//       let fullDescription = "";
//       if (fullDescriptionLines.length > 0) {
//         // ONLY TAKE FIRST TWO LINES
//         const firstTwoLines = fullDescriptionLines.slice(0, 2);
//         fullDescription = firstTwoLines.join(" ");
//         console.log(
//           `Found full description (first 2 of ${
//             fullDescriptionLines.length
//           } lines): "${fullDescription.substring(0, 100)}..."`
//         );
//       }

//       // Clean up the titles and descriptions
//       if (fullTitle) {
//         fullTitle = fullTitle
//           .replace(/^[●•▪▫○◙◘►▼▲\s]+/, "")
//           .replace(/[●•▪▫○◙◘►▼▲\s]+$/, "")
//           .trim();
//       }

//       if (fullDescription) {
//         fullDescription = fullDescription
//           .replace(/^[●•▪▫○◙◘►▼▲\s]+/, "")
//           .replace(/[●•▪▫○◙◘►▼▲\s]+$/, "")
//           .trim();
//       }

//       if (fullTitle && url) {
//         results.push({
//           title: fullTitle,
//           url: url.startsWith("http") ? url : `https://${url}`,
//           description: fullDescription || undefined,
//         });
//         console.log(`Added result: "${fullTitle}" -> ${url}`);
//       }
//     }
//   }

//   // Method 2: Alternative approach for better content grouping
//   if (results.length === 0) {
//     console.log("Trying alternative content grouping method...");

//     // Group lines by search result segments
//     const segments: Array<{
//       title: string;
//       url: string;
//       descriptionLines: string[];
//     }> = [];
//     let currentSegment: {
//       title: string;
//       url: string;
//       descriptionLines: string[];
//     } | null = null;

//     for (let i = 0; i < lines.length; i++) {
//       const line = lines[i];

//       // Check if this line starts a new segment (contains URL or looks like title)
//       const urlMatch = line.match(
//         /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/
//       );
//       const looksLikeTitle =
//         line.length > 10 &&
//         line.length < 150 &&
//         !line.match(/https?:\/\//) &&
//         !line.match(/[.,!?;:]$/);

//       if (
//         urlMatch ||
//         (looksLikeTitle &&
//           i + 1 < lines.length &&
//           lines[i + 1].match(/(https?:\/\/|www\.)/))
//       ) {
//         // Save previous segment
//         if (currentSegment) {
//           segments.push(currentSegment);
//         }

//         // Start new segment
//         if (urlMatch) {
//           currentSegment = {
//             title: i > 0 ? lines[i - 1] : line,
//             url: urlMatch[0],
//             descriptionLines: [],
//           };
//         } else {
//           currentSegment = {
//             title: line,
//             url: lines[i + 1],
//             descriptionLines: [],
//           };
//           i++; // Skip the URL line
//         }
//       } else if (
//         currentSegment &&
//         line.length > 5 &&
//         !line.match(/https?:\/\//)
//       ) {
//         // Add to current segment's description
//         currentSegment.descriptionLines.push(line);
//       }
//     }

//     // Add the last segment
//     if (currentSegment) {
//       segments.push(currentSegment);
//     }

//     // Convert segments to results
//     for (const segment of segments) {
//       // ONLY TAKE FIRST TWO LINES for description
//       const firstTwoLines = segment.descriptionLines.slice(0, 2);
//       const fullDescription = firstTwoLines.join(" ").trim();

//       results.push({
//         title: segment.title,
//         url: segment.url.startsWith("http")
//           ? segment.url
//           : `https://${segment.url}`,
//         description: fullDescription || undefined,
//       });
//     }
//   }

//   // Remove duplicates based on URL
//   // const uniqueResults = results.filter(
//   //   (result, index, self) =>
//   //     index === self.findIndex((r) => r.url === result.url)
//   // );

//   // console.log(`Final results: ${uniqueResults.length} unique results found`);
//   return results;
// }
// function extractSearchResults(text: string): SearchResult[] {
//   console.log("Raw OCR text for analysis:", text);

//   const results: SearchResult[] = [];
//   const lines = text
//     .split("\n")
//     .map((line) => line.trim())
//     .filter((line) => line.length > 0);

//   console.log("Cleaned lines:", lines);

//   // Method 1: Look for URL patterns and extract complete content
//   for (let i = 0; i < lines.length; i++) {
//     const line = lines[i];

//     // Enhanced URL detection
//     const urlMatch = line.match(
//       /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?(?:\/[^\s]*)?)/gi
//     );

//     if (urlMatch) {
//       const url = urlMatch[0];
//       console.log(`Found URL: ${url} at line ${i}`);

//       // Look for title in previous lines (red-marked text)
//       let title = "";
//       let initialDescription = "";
//       let fullDescriptionLines: string[] = [];

//       // Find the title (1-3 lines before URL)
//       for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
//         const potentialTitle = lines[j];
//         if (
//           potentialTitle &&
//           potentialTitle.length > 3 &&
//           potentialTitle.length < 200 &&
//           !potentialTitle.match(/https?:\/\//) &&
//           !potentialTitle.match(
//             /^(Q|广告|Sponsored|相关搜索|Related|Search|时间|找到|ページ|Page|\d+)/
//           ) &&
//           !potentialTitle.match(/^[0-9\s\.-]+$/) &&
//           !potentialTitle.includes("...") &&
//           (potentialTitle.match(/[a-zA-Z]/) ||
//             potentialTitle.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/))
//         ) {
//           title = potentialTitle;
//           console.log(`Found title: "${title}"`);
//           break;
//         }
//       }

//       // Find the initial description (line immediately after URL)
//       if (i + 1 < lines.length) {
//         const potentialDesc = lines[i + 1];
//         if (
//           potentialDesc &&
//           potentialDesc.length > 10 &&
//           potentialDesc.length < 300 &&
//           !potentialDesc.match(/https?:\/\//) &&
//           !potentialDesc.match(
//             /^(Q|广告|Sponsored|相关搜索|Related|Search|時間|找到|ページ|Page)/
//           ) &&
//           (potentialDesc.match(/[a-zA-Z]/) ||
//             potentialDesc.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/))
//         ) {
//           initialDescription = potentialDesc;
//           console.log(`Found initial description: "${initialDescription}"`);
//         }
//       }

//       // Find the FULL description content (multiple lines after initial description)
//       if (i + 2 < lines.length) {
//         const paragraphLines: string[] = [];

//         // Start from line after initial description
//         const startIndex = i + 2;

//         // Collect consecutive lines that belong to this search result
//         for (let k = startIndex; k < Math.min(lines.length, i + 15); k++) {
//           const currentLine = lines[k];

//           // Stop conditions for paragraph collection:
//           // 1. If we hit another URL (new search result)
//           if (currentLine.match(/(https?:\/\/|www\.)/)) {
//             break;
//           }

//           // 2. If line is very short and looks like a new title/separator
//           if (
//             currentLine.length < 25 &&
//             currentLine.split(/\s+/).length < 4 &&
//             !currentLine.match(/[.,!?;:]$/)
//           ) {
//             // Check if next line is a URL (indicating new result)
//             if (
//               k + 1 < lines.length &&
//               lines[k + 1].match(/(https?:\/\/|www\.)/)
//             ) {
//               break;
//             }
//           }

//           // 3. If line looks like the start of a new search result title
//           if (
//             currentLine.length > 10 &&
//             currentLine.length < 100 &&
//             !currentLine.match(/[.,!?;:]$/) &&
//             k + 1 < lines.length &&
//             lines[k + 1].match(/(https?:\/\/|www\.)/)
//           ) {
//             break;
//           }

//           // Add line to paragraph if it has content
//           if (
//             currentLine.length > 5 &&
//             !currentLine.match(/^(Q|广告|Sponsored|相关搜索|Related|Search)/)
//           ) {
//             paragraphLines.push(currentLine);
//           } else {
//             // If line is too short and doesn't look like content, stop
//             break;
//           }
//         }

//         fullDescriptionLines = paragraphLines;
//       } else if (initialDescription) {
//         // If no additional lines but we have initial description, use that
//         fullDescriptionLines = [initialDescription];
//       }

//       // Combine title and initial description for the title field
//       let fullTitle = title;
//       if (title && initialDescription) {
//         fullTitle = `${initialDescription}`;
//       } else if (initialDescription) {
//         fullTitle = initialDescription;
//       }

//       // Create the full description from only the first two collected lines
//       let fullDescription = "";
//       if (fullDescriptionLines.length > 0) {
//         // ONLY TAKE FIRST TWO LINES
//         const firstTwoLines = fullDescriptionLines.slice(0, 2);
//         fullDescription = firstTwoLines.join(" ");
//         console.log(
//           `Found full description (first 2 of ${
//             fullDescriptionLines.length
//           } lines): "${fullDescription.substring(0, 100)}..."`
//         );
//       }

//       // Clean up the titles and descriptions
//       if (fullTitle) {
//         fullTitle = fullTitle
//           .replace(/^[●•▪▫○◙◘►▼▲\s]+/, "")
//           .replace(/[●•▪▫○◙◘►▼▲\s]+$/, "")
//           .trim();
//       }

//       if (fullDescription) {
//         fullDescription = fullDescription
//           .replace(/^[●•▪▫○◙◘►▼▲\s]+/, "")
//           .replace(/[●•▪▫○◙◘►▼▲\s]+$/, "")
//           .trim();
//       }

//       // ONLY ADD RESULT IF THERE IS A DESCRIPTION
//       if (fullTitle && url && fullDescription) {
//         results.push({
//           title: fullTitle,
//           url: url.startsWith("http") ? url : `https://${url}`,
//           description: fullDescription,
//         });
//         console.log(`Added result: "${fullTitle}" -> ${url}`);
//       } else {
//         console.log(
//           `Skipped result - missing description: "${fullTitle}" -> ${url}`
//         );
//       }
//     }
//   }

//   // Method 2: Alternative approach for better content grouping
//   if (results.length === 0) {
//     console.log("Trying alternative content grouping method...");

//     // Group lines by search result segments
//     const segments: Array<{
//       title: string;
//       url: string;
//       descriptionLines: string[];
//     }> = [];
//     let currentSegment: {
//       title: string;
//       url: string;
//       descriptionLines: string[];
//     } | null = null;

//     for (let i = 0; i < lines.length; i++) {
//       const line = lines[i];

//       // Check if this line starts a new segment (contains URL or looks like title)
//       const urlMatch = line.match(
//         /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/
//       );
//       const looksLikeTitle =
//         line.length > 10 &&
//         line.length < 150 &&
//         !line.match(/https?:\/\//) &&
//         !line.match(/[.,!?;:]$/);

//       if (
//         urlMatch ||
//         (looksLikeTitle &&
//           i + 1 < lines.length &&
//           lines[i + 1].match(/(https?:\/\/|www\.)/))
//       ) {
//         // Save previous segment
//         if (currentSegment) {
//           segments.push(currentSegment);
//         }

//         // Start new segment
//         if (urlMatch) {
//           currentSegment = {
//             title: i > 0 ? lines[i - 1] : line,
//             url: urlMatch[0],
//             descriptionLines: [],
//           };
//         } else {
//           currentSegment = {
//             title: line,
//             url: lines[i + 1],
//             descriptionLines: [],
//           };
//           i++; // Skip the URL line
//         }
//       } else if (
//         currentSegment &&
//         line.length > 5 &&
//         !line.match(/https?:\/\//)
//       ) {
//         // Add to current segment's description
//         currentSegment.descriptionLines.push(line);
//       }
//     }

//     // Add the last segment
//     if (currentSegment) {
//       segments.push(currentSegment);
//     }

//     // Convert segments to results
//     for (const segment of segments) {
//       // ONLY TAKE FIRST TWO LINES for description
//       const firstTwoLines = segment.descriptionLines.slice(0, 2);
//       const fullDescription = firstTwoLines.join(" ").trim();

//       // ONLY ADD RESULT IF THERE IS A DESCRIPTION
//       if (fullDescription) {
//         results.push({
//           title: segment.title,
//           url: segment.url.startsWith("http")
//             ? segment.url
//             : `https://${segment.url}`,
//           description: fullDescription,
//         });
//       } else {
//         console.log(
//           `Skipped result - missing description: "${segment.title}" -> ${segment.url}`
//         );
//       }
//     }
//   }

//   // Remove duplicates based on URL
//   const uniqueResults = results.filter(
//     (result, index, self) =>
//       index === self.findIndex((r) => r.url === result.url)
//   );

//   console.log(`Final results: ${uniqueResults.length} unique results found`);
//   return results;
// }
// function extractSearchResults(text: string): SearchResult[] {
//   console.log("Raw OCR text for analysis:", text);

//   const results: SearchResult[] = [];
//   const lines = text
//     .split("\n")
//     .map((line) => line.trim())
//     .filter((line) => line.length > 0);

//   console.log("Cleaned lines:", lines);

//   // Method 1: Look for URL patterns and extract complete content
//   for (let i = 0; i < lines.length; i++) {
//     const line = lines[i];

//     // Enhanced URL detection
//     const urlMatch = line.match(
//       /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?(?:\/[^\s]*)?)/gi
//     );

//     if (urlMatch) {
//       const url = urlMatch[0];
//       console.log(`Found URL: ${url} at line ${i}`);

//       // Look for title in previous lines (red-marked text)
//       let title = "";
//       let initialDescription = "";
//       let fullDescriptionLines: string[] = [];

//       // Find the title (1-3 lines before URL)
//       for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
//         const potentialTitle = lines[j];
//         if (
//           potentialTitle &&
//           potentialTitle.length > 3 &&
//           potentialTitle.length < 200 &&
//           !potentialTitle.match(/https?:\/\//) &&
//           !potentialTitle.match(
//             /^(Q|广告|Sponsored|相关搜索|Related|Search|时间|找到|ページ|Page|\d+)/
//           ) &&
//           !potentialTitle.match(/^[0-9\s\.-]+$/) &&
//           !potentialTitle.includes("...") &&
//           (potentialTitle.match(/[a-zA-Z]/) ||
//             potentialTitle.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/))
//         ) {
//           title = potentialTitle;
//           console.log(`Found title: "${title}"`);
//           break;
//         }
//       }

//       // Find the initial description (line immediately after URL)
//       if (i + 1 < lines.length) {
//         const potentialDesc = lines[i + 1];
//         if (
//           potentialDesc &&
//           potentialDesc.length > 10 &&
//           potentialDesc.length < 300 &&
//           !potentialDesc.match(/https?:\/\//) &&
//           !potentialDesc.match(
//             /^(Q|广告|Sponsored|相关搜索|Related|Search|時間|找到|ページ|Page)/
//           ) &&
//           (potentialDesc.match(/[a-zA-Z]/) ||
//             potentialDesc.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/))
//         ) {
//           initialDescription = potentialDesc;
//           console.log(`Found initial description: "${initialDescription}"`);
//         }
//       }

//       // Find the FULL description content (multiple lines after initial description)
//       if (i + 2 < lines.length) {
//         const paragraphLines: string[] = [];

//         // Start from line after initial description
//         const startIndex = i + 2;

//         // Collect consecutive lines that belong to this search result
//         for (let k = startIndex; k < Math.min(lines.length, i + 15); k++) {
//           const currentLine = lines[k];

//           // Stop conditions for paragraph collection:
//           // 1. If we hit another URL (new search result)
//           if (currentLine.match(/(https?:\/\/|www\.)/)) {
//             break;
//           }

//           // 2. If line is very short and looks like a new title/separator
//           if (
//             currentLine.length < 25 &&
//             currentLine.split(/\s+/).length < 4 &&
//             !currentLine.match(/[.,!?;:]$/)
//           ) {
//             // Check if next line is a URL (indicating new result)
//             if (
//               k + 1 < lines.length &&
//               lines[k + 1].match(/(https?:\/\/|www\.)/)
//             ) {
//               break;
//             }
//           }

//           // 3. If line looks like the start of a new search result title
//           if (
//             currentLine.length > 10 &&
//             currentLine.length < 100 &&
//             !currentLine.match(/[.,!?;:]$/) &&
//             k + 1 < lines.length &&
//             lines[k + 1].match(/(https?:\/\/|www\.)/)
//           ) {
//             break;
//           }

//           // Add line to paragraph if it has content
//           if (
//             currentLine.length > 5 &&
//             !currentLine.match(/^(Q|广告|Sponsored|相关搜索|Related|Search)/)
//           ) {
//             paragraphLines.push(currentLine);
//           } else {
//             // If line is too short and doesn't look like content, stop
//             break;
//           }
//         }

//         fullDescriptionLines = paragraphLines;
//       } else if (initialDescription) {
//         // If no additional lines but we have initial description, use that
//         fullDescriptionLines = [initialDescription];
//       }

//       // Combine title and initial description for the title field
//       let fullTitle = title;
//       if (title && initialDescription) {
//         fullTitle = `${initialDescription}`;
//       } else if (initialDescription) {
//         fullTitle = initialDescription;
//       }

//       // Create the full description from only the first two collected lines
//       let fullDescription = "";
//       if (fullDescriptionLines.length > 0) {
//         // ONLY TAKE FIRST TWO LINES
//         const firstTwoLines = fullDescriptionLines.slice(0, 2);
//         fullDescription = firstTwoLines.join(" ");
//         console.log(
//           `Found full description (first 2 of ${
//             fullDescriptionLines.length
//           } lines): "${fullDescription.substring(0, 100)}..."`
//         );
//       }

//       // Clean up the titles and descriptions
//       if (fullTitle) {
//         fullTitle = fullTitle
//           .replace(/^[●•▪▫○◙◘►▼▲\s]+/, "")
//           .replace(/[●•▪▫○◙◘►▼▲\s]+$/, "")
//           .trim();
//       }

//       if (fullDescription) {
//         fullDescription = fullDescription
//           .replace(/^[●•▪▫○◙◘►▼▲\s]+/, "")
//           .replace(/[●•▪▫○◙◘►▼▲\s]+$/, "")
//           .trim();
//       }

//       if (fullTitle && url) {
//         results.push({
//           title: fullTitle,
//           url: url.startsWith("http") ? url : `https://${url}`,
//           description: fullDescription || undefined,
//         });
//         console.log(`Added result: "${fullTitle}" -> ${url}`);
//       }
//     }
//   }

//   // Method 2: Alternative approach for better content grouping
//   if (results.length === 0) {
//     console.log("Trying alternative content grouping method...");

//     // Group lines by search result segments
//     const segments: Array<{
//       title: string;
//       url: string;
//       descriptionLines: string[];
//     }> = [];
//     let currentSegment: {
//       title: string;
//       url: string;
//       descriptionLines: string[];
//     } | null = null;

//     for (let i = 0; i < lines.length; i++) {
//       const line = lines[i];

//       // Check if this line starts a new segment (contains URL or looks like title)
//       const urlMatch = line.match(
//         /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/
//       );
//       const looksLikeTitle =
//         line.length > 10 &&
//         line.length < 150 &&
//         !line.match(/https?:\/\//) &&
//         !line.match(/[.,!?;:]$/);

//       if (
//         urlMatch ||
//         (looksLikeTitle &&
//           i + 1 < lines.length &&
//           lines[i + 1].match(/(https?:\/\/|www\.)/))
//       ) {
//         // Save previous segment
//         if (currentSegment) {
//           segments.push(currentSegment);
//         }

//         // Start new segment
//         if (urlMatch) {
//           currentSegment = {
//             title: i > 0 ? lines[i - 1] : line,
//             url: urlMatch[0],
//             descriptionLines: [],
//           };
//         } else {
//           currentSegment = {
//             title: line,
//             url: lines[i + 1],
//             descriptionLines: [],
//           };
//           i++; // Skip the URL line
//         }
//       } else if (
//         currentSegment &&
//         line.length > 5 &&
//         !line.match(/https?:\/\//)
//       ) {
//         // Add to current segment's description
//         currentSegment.descriptionLines.push(line);
//       }
//     }

//     // Add the last segment
//     if (currentSegment) {
//       segments.push(currentSegment);
//     }

//     // Convert segments to results
//     for (const segment of segments) {
//       // ONLY TAKE FIRST TWO LINES for description
//       const firstTwoLines = segment.descriptionLines.slice(0, 2);
//       const fullDescription = firstTwoLines.join(" ").trim();

//       results.push({
//         title: segment.title,
//         url: segment.url.startsWith("http")
//           ? segment.url
//           : `https://${segment.url}`,
//         description: fullDescription || undefined,
//       });
//     }
//   }

//   // Remove duplicates based on URL
//   const uniqueResults = results.filter(
//     (result, index, self) =>
//       index === self.findIndex((r) => r.url === result.url)
//   );

//   console.log(`Final results: ${uniqueResults.length} unique results found`);
//   return results;
// }
function extractSearchResults(text: string): SearchResult[] {
  console.log("Raw OCR text for analysis:", text);

  const results: SearchResult[] = [];
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  console.log("Cleaned lines:", lines);

  // Look for URL patterns and extract title + description
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Enhanced URL detection
    const urlMatch = line.match(
      /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?(?:\/[^\s]*)?)/gi
    );

    if (urlMatch) {
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
          !potentialTitle.match(/^[0-9\s\.-]+$/) // Exclude pure numbers
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
