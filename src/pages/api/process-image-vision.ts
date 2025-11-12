import { cleanText, extractSearchResults } from "@/lib/searchResults";
import { ApiResponse } from "@/types/type";
import Busboy from "busboy";
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
    responseLimit: "10mb",
  },
};

const GOOGLE_VISION_API_KEY = process.env.GOOGLE_VISION_API_KEY || "";

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB (Vision base64 limit ~6MB)
const SUPPORTED_LANGUAGES = ["jpn", "eng", "chi", "kor"];
const DEFAULT_LANGUAGE = "jpn";
const LANGUAGE_HINTS: Record<string, string> = {
  jpn: "ja",
  eng: "en",
  chi: "zh",
  kor: "ko",
};

interface ProcessedFile {
  fields: { language?: string };
  fileBuffer: Buffer;
}

function validateLanguage(language: string): string {
  return SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;
}

function parseLanguageHint(language: string): string | undefined {
  return LANGUAGE_HINTS[language];
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

async function runVisionOCR(
  imageBuffer: Buffer,
  language: string
): Promise<string> {
  if (!GOOGLE_VISION_API_KEY) {
    throw new Error(
      "Google Vision API key is not configured. Add GOOGLE_VISION_API_KEY to your environment."
    );
  }

  const base64Image = imageBuffer.toString("base64");
  const languageHint = parseLanguageHint(language);

  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64Image },
            features: [{ type: "TEXT_DETECTION" }],
            imageContext: languageHint
              ? { languageHints: [languageHint] }
              : undefined,
          },
        ],
      }),
    }
  );

  const payload = (await response.json()) as {
    responses?: Array<{
      fullTextAnnotation?: { text?: string };
      textAnnotations?: Array<{ description?: string }>;
      error?: { message?: string };
    }>;
    error?: { message?: string };
  };

  console.log(
    "[Vision] API response:",
    JSON.stringify(payload, null, 2).slice(0, 4000)
  );

  if (!response.ok) {
    const detail =
      payload.error?.message ||
      payload.responses?.[0]?.error?.message ||
      response.statusText;
    throw new Error(
      `Vision API request failed with status ${response.status}: ${detail}`
    );
  }

  const firstResponse = payload.responses?.[0];

  if (firstResponse?.error?.message) {
    throw new Error(`Vision API error: ${firstResponse.error.message}`);
  }

  const text =
    firstResponse?.fullTextAnnotation?.text ||
    firstResponse?.textAnnotations?.[0]?.description ||
    "";

  if (!text) {
    throw new Error(
      "Vision API did not return any text. Ensure the image contains readable content."
    );
  }

  return text;
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
        message:
          "Image too large for Google Vision. Please upload a file under 4MB.",
      });
    }

    const language = fields.language || DEFAULT_LANGUAGE;

    const rawText = await runVisionOCR(fileBuffer, language);
    const cleanedText = cleanText(rawText);
    const searchResults = extractSearchResults(cleanedText);

    return res.status(200).json({
      status: "success",
      text: cleanedText,
      rawText,
      searchResults,
      resultCount: searchResults.length,
      resultsCount: searchResults.length,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while processing your image.";

    let userMessage = errorMessage;
    if (errorMessage.includes("not configured")) {
      userMessage =
        "Google Vision API key missing. Ask an admin to configure it.";
    } else if (errorMessage.includes("Vision API request failed")) {
      userMessage = "Vision API rejected the request. Please retry shortly.";
    }

    return res.status(500).json({
      status: "error",
      message: userMessage,
    });
  }
}
