// pages/api/extract-red-text.js
import fs from "fs";
import path from "path";
import cv from "opencv4nodejs";
import Tesseract from "tesseract.js";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const buffer = Buffer.concat(chunks);

  const tempPath = path.join(process.cwd(), "temp.png");
  fs.writeFileSync(tempPath, buffer);

  const src = cv.imread(tempPath);
  const hsv = src.cvtColor(cv.COLOR_BGR2HSV);

  // Red color thresholds
  const lowerRed1 = new cv.Vec(0, 70, 50);
  const upperRed1 = new cv.Vec(10, 255, 255);
  const lowerRed2 = new cv.Vec(170, 70, 50);
  const upperRed2 = new cv.Vec(180, 255, 255);

  const mask1 = hsv.inRange(lowerRed1, upperRed1);
  const mask2 = hsv.inRange(lowerRed2, upperRed2);
  const mask = mask1.bitwiseOr(mask2);

  const contours = mask.findContours(cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
  const results = [];

  for (const cnt of contours) {
    const rect = cnt.boundingRect();
    const roi = src.getRegion(rect);

    const roiBuffer = cv.imencode(".png", roi);

    const {
      data: { text },
    } = await Tesseract.recognize(roiBuffer, "eng");
    results.push({ text: text.trim(), box: rect });
  }

  fs.unlinkSync(tempPath);
  res.status(200).json({ results });
}
