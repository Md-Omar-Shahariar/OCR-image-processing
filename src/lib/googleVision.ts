import Busboy from "busboy";
import { NextApiRequest } from "next";

const GOOGLE_VISION_API_KEY = process.env.GOOGLE_VISION_API_KEY || "";

export const VISION_MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
export const VISION_SUPPORTED_LANGUAGES = ["jpn", "eng", "chi", "kor"] as const;
export const DEFAULT_VISION_LANGUAGE: (typeof VISION_SUPPORTED_LANGUAGES)[number] =
  "jpn";

const LANGUAGE_HINTS: Record<string, string> = {
  jpn: "ja",
  eng: "en",
  chi: "zh",
  kor: "ko",
};

export interface VisionProcessedFile {
  fields: { language?: string };
  fileBuffer: Buffer;
}

function validateLanguage(language?: string) {
  if (!language) return undefined;
  return VISION_SUPPORTED_LANGUAGES.includes(language as never)
    ? language
    : undefined;
}

function parseLanguageHint(language: string | undefined) {
  if (!language) return undefined;
  return LANGUAGE_HINTS[language];
}

export function resolveVisionLanguage(
  language?: string | null
): (typeof VISION_SUPPORTED_LANGUAGES)[number] {
  return validateLanguage(language || undefined) || DEFAULT_VISION_LANGUAGE;
}

export async function parseVisionFormData(
  req: NextApiRequest,
  maxSize = VISION_MAX_FILE_SIZE
): Promise<VisionProcessedFile> {
  return new Promise<VisionProcessedFile>((resolve, reject) => {
    const busboy = Busboy({
      headers: req.headers,
      limits: {
        fileSize: maxSize,
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
        if (name !== "file") {
          file.resume();
          return;
        }

        if (!info?.mimeType?.startsWith("image/")) {
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

export async function runVisionOCR(
  imageBuffer: Buffer,
  language: string,
  featureType: "TEXT_DETECTION" | "DOCUMENT_TEXT_DETECTION" = "TEXT_DETECTION"
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
            features: [{ type: featureType }],
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
