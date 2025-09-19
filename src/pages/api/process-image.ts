// // import formidable from "formidable";
// // import fs from "fs";
// // import fetch from "node-fetch";
// // import sharp from "sharp";
// // import FormData from "form-data";
// // import type { NextApiRequest, NextApiResponse } from "next";
// // import type { IncomingMessage, ServerResponse } from "http";

// // export const config = {
// //   api: {
// //     bodyParser: false,
// //   },
// // };

// // const API_KEY = process.env.OCR_SPACE_API_KEY || "";
// // const URL = "https://api.ocr.space/parse/image";
// // const MAX_SIZE = 2000;
// // const CONTRAST = 2;

// // interface OcrSpaceParsedResult {
// //   ParsedText?: string;
// // }

// // interface OcrSpaceResponse {
// //   IsErroredOnProcessing?: boolean;
// //   ErrorMessage?: string[];
// //   ParsedResults?: OcrSpaceParsedResult[];
// // }

// // export default async function handler(
// //   req: NextApiRequest,
// //   res: NextApiResponse
// // ): Promise<void> {
// //   if (req.method !== "POST") {
// //     return res
// //       .status(405)
// //       .json({ status: "error", message: "Method not allowed" });
// //   }

// //   try {
// //     // ✅ Wrap formidable parsing in a Promise
// //     const { fields, files } = await new Promise<{
// //       fields: formidable.Fields;
// //       files: formidable.Files;
// //     }>((resolve, reject) => {
// //       const form = formidable();
// //       form.parse(req as IncomingMessage, (err, fields, files) => {
// //         if (err) reject(err);
// //         else resolve({ fields, files });
// //       });
// //     });

// //     const language: string[] = Array.isArray(fields.language)
// //       ? fields.language
// //       : [fields.language ?? "jpn"];

// //     if (!files.file || !Array.isArray(files.file) || !files.file[0]) {
// //       return res
// //         .status(400)
// //         .json({ status: "error", message: "No file uploaded." });
// //     }

// //     const filePath: string = files.file[0].filepath;
// //     let imageBuffer: Buffer = fs.readFileSync(filePath);

// //     // Preprocess image
// //     imageBuffer = await sharp(imageBuffer)
// //       .resize({ width: MAX_SIZE, height: MAX_SIZE, fit: "inside" })
// //       .grayscale()
// //       .modulate({ brightness: 1, saturation: CONTRAST })
// //       .png()
// //       .toBuffer();

// //     const formData = new FormData();
// //     formData.append("file", imageBuffer, {
// //       filename: "image.png",
// //       contentType: "image/png",
// //     });
// //     formData.append("apikey", API_KEY);
// //     formData.append("language", language[0]);
// //     formData.append("OCREngine", "2");

// //     const response = await fetch(URL, { method: "POST", body: formData });

// //     const result: OcrSpaceResponse =
// //       (await response.json()) as OcrSpaceResponse;

// //     if (result?.IsErroredOnProcessing) {
// //       return res.status(500).json({
// //         status: "error",
// //         message: result?.ErrorMessage?.[0] || "OCR processing error",
// //       });
// //     }

// //     const text: string = result?.ParsedResults?.[0]?.ParsedText || "";
// //     return res.status(200).json({ status: "success", text });
// //   } catch (error: unknown) {
// //     console.error("OCR API Error:", error);
// //     const message: string =
// //       error instanceof Error ? error.message : "Unknown error";
// //     return res.status(500).json({ status: "error", message });
// //   }
// // }

// import formidable from "formidable";
// import fs from "fs";
// import sharp from "sharp";
// import fetch from "node-fetch";
// import FormData from "form-data";
// import type { NextApiRequest, NextApiResponse } from "next";
// import type { IncomingMessage } from "http";

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// const API_KEY = process.env.OCR_SPACE_API_KEY || "";
// const URL = "https://api.ocr.space/parse/image";
// const MAX_SIZE = 2000;
// const CONTRAST = 2;

// interface OcrSpaceParsedResult {
//   ParsedText?: string;
// }

// interface OcrSpaceResponse {
//   IsErroredOnProcessing?: boolean;
//   ErrorMessage?: string[];
//   ParsedResults?: OcrSpaceParsedResult[];
// }

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ): Promise<void> {
//   if (req.method !== "POST") {
//     return res
//       .status(405)
//       .json({ status: "error", message: "Method not allowed" });
//   }

//   try {
//     const { fields, files } = await new Promise<{
//       fields: formidable.Fields;
//       files: formidable.Files;
//     }>((resolve, reject) => {
//       const form = formidable();
//       form.parse(req as IncomingMessage, (err, fields, files) => {
//         if (err) reject(err);
//         else resolve({ fields, files });
//       });
//     });

//     const language: string[] = Array.isArray(fields.language)
//       ? fields.language
//       : [fields.language ?? "jpn"];

//     if (!files.file || !Array.isArray(files.file) || !files.file[0]) {
//       return res
//         .status(400)
//         .json({ status: "error", message: "No file uploaded." });
//     }

//     // ✅ Read the file buffer from the file path
//     const filePath: string = files.file[0].filepath;
//     let imageBuffer: Buffer = fs.readFileSync(filePath);

//     // Check if imageBuffer exists before proceeding
//     if (!imageBuffer) {
//       throw new Error("Could not get file buffer from upload.");
//     }

//     // Preprocess image
//     imageBuffer = await sharp(imageBuffer)
//       .resize({ width: MAX_SIZE, height: MAX_SIZE, fit: "inside" })
//       .grayscale()
//       .modulate({ brightness: 1, saturation: CONTRAST })
//       .png()
//       .toBuffer();

//     const formData = new FormData();
//     formData.append("file", imageBuffer, {
//       filename: "image.png",
//       contentType: "image/png",
//     });
//     formData.append("apikey", API_KEY);
//     formData.append("language", language[0]);
//     formData.append("OCREngine", "2");

//     const response = await fetch(URL, { method: "POST", body: formData });

//     const result: OcrSpaceResponse =
//       (await response.json()) as OcrSpaceResponse;

//     if (result?.IsErroredOnProcessing) {
//       return res.status(500).json({
//         status: "error",
//         message: result?.ErrorMessage?.[0] || "OCR processing error",
//       });
//     }

//     const text: string = result?.ParsedResults?.[0]?.ParsedText || "";
//     return res.status(200).json({ status: "success", text });
//   } catch (error: unknown) {
//     console.error("OCR API Error:", error);
//     const message: string =
//       error instanceof Error ? error.message : "Unknown error";
//     return res.status(500).json({ status: "error", message });
//   }
// }

import { NextApiRequest, NextApiResponse } from "next";
import sharp from "sharp";
import fetch from "node-fetch";
import FormData from "form-data";
import Busboy from "busboy";

export const config = {
  api: {
    bodyParser: false,
  },
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
    const busboy = Busboy({ headers: req.headers });
    let fileBuffer: Buffer | null = null;
    let language = "jpn";

    return new Promise<void>((resolve) => {
      busboy.on("file", (fieldname, file, info) => {
        if (fieldname === "file") {
          const chunks: Buffer[] = [];
          file.on("data", (chunk) => {
            chunks.push(chunk);
          });
          file.on("end", () => {
            fileBuffer = Buffer.concat(chunks);
          });
        }
      });

      busboy.on("field", (fieldname, value) => {
        if (fieldname === "language") {
          language = value;
        }
      });

      busboy.on("finish", async () => {
        if (!fileBuffer) {
          res
            .status(400)
            .json({ status: "error", message: "No file uploaded." });
          return resolve();
        }

        try {
          const processedImage = await sharp(fileBuffer)
            .resize({ width: MAX_SIZE, height: MAX_SIZE, fit: "inside" })
            .grayscale()
            .modulate({ brightness: 1, saturation: CONTRAST })
            .png()
            .toBuffer();

          const formData = new FormData();
          formData.append("file", processedImage, {
            filename: "image.png",
            contentType: "image/png",
          });
          formData.append("apikey", API_KEY);
          formData.append("language", language);
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
          console.error("Processing error:", error);
          const message: string =
            error instanceof Error ? error.message : "Unknown error";
          res.status(500).json({ status: "error", message });
        }
        resolve();
      });

      req.pipe(busboy);
    });
  } catch (error: unknown) {
    console.error("OCR API Error:", error);
    const message: string =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ status: "error", message });
  }
}
