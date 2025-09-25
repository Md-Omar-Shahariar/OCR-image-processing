// components/RedBoxOCR.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import { createWorker } from "tesseract.js";

// Type definitions
interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface OCRResult {
  box: Box;
  text: string;
  confidence?: number;
}

// Declare OpenCV types
declare global {
  interface Window {
    cv: any;
  }
}

export default function RedBoxOCR() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [results, setResults] = useState<OCRResult[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("Ready to upload image");

  // Load OpenCV dynamically
  useEffect(() => {
    const loadOpenCV = async (): Promise<void> => {
      if (typeof window !== "undefined" && window.cv) {
        setStatus("OpenCV loaded successfully");
        return;
      }

      try {
        setStatus("Loading OpenCV...");

        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://docs.opencv.org/4.8.0/opencv.js";
          script.async = true;
          script.onload = () => {
            const checkCV = () => {
              if (window.cv && window.cv.Mat) {
                setStatus("OpenCV loaded successfully");
                resolve();
              } else {
                setTimeout(checkCV, 100);
              }
            };
            checkCV();
          };
          script.onerror = () => reject(new Error("Failed to load OpenCV"));
          document.head.appendChild(script);
        });
      } catch (error) {
        setStatus(
          "Error loading OpenCV. Using canvas-based detection instead."
        );
        console.error("OpenCV loading failed:", error);
      }
    };

    loadOpenCV();
  }, []);

  // Simple red color detection without OpenCV
  const detectRedBoxesWithCanvas = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ): Box[] => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const redAreas: Box[] = [];
    const visited = new Set<string>();
    const minBoxSize = 50;

    // Simple red detection
    for (let y = 0; y < height; y += 2) {
      for (let x = 0; x < width; x += 2) {
        const index = (y * width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];

        // Detect red pixels (high red, low green/blue)
        if (r > 150 && g < 100 && b < 100 && r > g + 50 && r > b + 50) {
          const pos = `${x},${y}`;
          if (!visited.has(pos)) {
            // Flood fill to find connected red area
            const box = floodFillRed(x, y, data, width, height, visited);
            if (box.width > minBoxSize && box.height > minBoxSize) {
              redAreas.push(box);
            }
          }
        }
      }
    }

    return redAreas;
  };

  // Flood fill algorithm to find connected red areas
  const floodFillRed = (
    startX: number,
    startY: number,
    data: Uint8ClampedArray,
    width: number,
    height: number,
    visited: Set<string>
  ): Box => {
    const queue: [number, number][] = [[startX, startY]];
    let minX = startX,
      minY = startY,
      maxX = startX,
      maxY = startY;

    while (queue.length > 0) {
      const [x, y] = queue.shift()!;
      const pos = `${x},${y}`;

      if (visited.has(pos) || x < 0 || x >= width || y < 0 || y >= height) {
        continue;
      }

      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];

      if (r > 150 && g < 100 && b < 100 && r > g + 50 && r > b + 50) {
        visited.add(pos);
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);

        // Add neighbors
        queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
      }
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  };

  // Helper function to create Scalar with proper 4 elements
  const createScalar = (
    h: number,
    s: number,
    v: number
  ): [number, number, number, number] => {
    return [h, s, v, 0]; // Add alpha channel as 0
  };

  const handleImage = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setStatus("Processing image...");
    setResults([]);

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = async () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        setIsProcessing(false);
        setStatus("Canvas not available");
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsProcessing(false);
        setStatus("Canvas context not available");
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      try {
        let redBoxes: Box[] = [];
        const texts: OCRResult[] = [];

        if (window.cv && window.cv.Mat) {
          setStatus("Using OpenCV for detection...");

          // OpenCV detection - FIXED: Use proper Scalar values
          const src = window.cv.imread(canvas);
          const hsv = new window.cv.Mat();

          // Convert to HSV properly
          window.cv.cvtColor(src, hsv, window.cv.COLOR_RGBA2RGB);
          window.cv.cvtColor(hsv, hsv, window.cv.COLOR_RGB2HSV);

          // FIXED: Create HSV range with proper 4-element Scalars
          const lowRed1 = new window.cv.Mat(
            hsv.rows,
            hsv.cols,
            hsv.type(),
            createScalar(0, 100, 100)
          );
          const highRed1 = new window.cv.Mat(
            hsv.rows,
            hsv.cols,
            hsv.type(),
            createScalar(10, 255, 255)
          );
          const lowRed2 = new window.cv.Mat(
            hsv.rows,
            hsv.cols,
            hsv.type(),
            createScalar(160, 100, 100)
          );
          const highRed2 = new window.cv.Mat(
            hsv.rows,
            hsv.cols,
            hsv.type(),
            createScalar(180, 255, 255)
          );

          const mask1 = new window.cv.Mat();
          const mask2 = new window.cv.Mat();
          const redMask = new window.cv.Mat();

          window.cv.inRange(hsv, lowRed1, highRed1, mask1);
          window.cv.inRange(hsv, lowRed2, highRed2, mask2);
          window.cv.bitwise_or(mask1, mask2, redMask);

          // Optional: Apply morphological operations to clean up the mask
          const kernel = window.cv.getStructuringElement(
            window.cv.MORPH_RECT,
            new window.cv.Size(5, 5)
          );
          window.cv.morphologyEx(
            redMask,
            redMask,
            window.cv.MORPH_CLOSE,
            kernel
          );
          window.cv.morphologyEx(
            redMask,
            redMask,
            window.cv.MORPH_OPEN,
            kernel
          );

          const contours = new window.cv.MatVector();
          const hierarchy = new window.cv.Mat();
          window.cv.findContours(
            redMask,
            contours,
            hierarchy,
            window.cv.RETR_EXTERNAL,
            window.cv.CHAIN_APPROX_SIMPLE
          );

          for (let i = 0; i < contours.size(); i++) {
            const contour = contours.get(i);
            const rect = window.cv.boundingRect(contour);
            // Filter small detections
            if (rect.width > 50 && rect.height > 50) {
              redBoxes.push({
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
              });
            }
            contour.delete();
          }

          // Cleanup OpenCV objects
          const objectsToDelete = [
            src,
            hsv,
            lowRed1,
            highRed1,
            lowRed2,
            highRed2,
            mask1,
            mask2,
            redMask,
            contours,
            hierarchy,
            kernel,
          ];

          objectsToDelete.forEach((mat) => {
            if (mat && !mat.isDeleted) {
              try {
                mat.delete();
              } catch (error) {
                console.warn("Error deleting OpenCV object:", error);
              }
            }
          });
        } else {
          setStatus("Using canvas-based detection...");
          // Fallback to canvas-based detection
          redBoxes = detectRedBoxesWithCanvas(ctx, img.width, img.height);
        }

        setStatus(`Found ${redBoxes.length} red boxes. Performing OCR...`);

        // Perform OCR on each detected box
        const worker = await createWorker("jpn");

        for (let i = 0; i < redBoxes.length; i++) {
          const rect = redBoxes[i];

          // Create a canvas for the ROI
          const roiCanvas = document.createElement("canvas");
          roiCanvas.width = Math.max(rect.width, 1);
          roiCanvas.height = Math.max(rect.height, 1);
          const roiCtx = roiCanvas.getContext("2d");

          if (!roiCtx || rect.width <= 0 || rect.height <= 0) {
            continue;
          }

          // Draw the region to the ROI canvas
          roiCtx.drawImage(
            canvas,
            rect.x,
            rect.y,
            rect.width,
            rect.height,
            0,
            0,
            rect.width,
            rect.height
          );

          try {
            // Perform OCR
            const { data } = await worker.recognize(roiCanvas);

            if (data.text.trim()) {
              texts.push({
                box: rect,
                text: data.text.trim(),
                confidence: data.confidence,
              });
            }

            // Draw bounding box on original canvas
            ctx.strokeStyle = "#00ff00";
            ctx.lineWidth = 3;
            ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
            ctx.fillStyle = "#00ff00";
            ctx.font = "16px Arial";
            ctx.fillText(`Box ${i + 1}`, rect.x, rect.y - 5);
          } catch (error) {
            console.error(`OCR error for box ${i + 1}:`, error);
          }
        }

        await worker.terminate();
        setResults(texts);
        setStatus(`Processing complete. Found ${texts.length} text elements.`);
      } catch (error) {
        console.error("Error processing image:", error);
        setStatus(
          `Error processing image: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      } finally {
        setIsProcessing(false);
        URL.revokeObjectURL(img.src);
      }
    };

    img.onerror = () => {
      setIsProcessing(false);
      setStatus("Error loading image");
    };
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Red Box Text Extractor</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="file"
          accept="image/*"
          onChange={handleImage}
          disabled={isProcessing}
          style={{ marginBottom: "10px" }}
        />

        <div
          style={{
            padding: "10px",
            backgroundColor: "#f5f5f5",
            borderRadius: "5px",
            marginBottom: "10px",
            minHeight: "20px",
          }}
        >
          <strong>Status:</strong> {status}
        </div>

        {isProcessing && (
          <div style={{ color: "#007acc" }}>
            ⏳ Processing... This may take a moment for large images.
          </div>
        )}
      </div>

      <canvas
        ref={canvasRef}
        style={{
          border: "1px solid #ddd",
          marginTop: 10,
          maxWidth: "100%",
          display: results.length > 0 ? "block" : "none",
        }}
      />

      {results.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Detected Text in Red Boxes:</h3>
          <div
            style={{
              backgroundColor: "#f5f5f5",
              padding: "15px",
              borderRadius: "5px",
              border: "1px solid #ddd",
            }}
          >
            {results.map((result, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "10px",
                  padding: "10px",
                  backgroundColor: "black",
                  borderRadius: "3px",
                }}
              >
                <strong>Box {index + 1}:</strong> {result.text}
                {result.confidence && (
                  <span
                    style={{
                      fontSize: "12px",
                      color: "white",
                      marginLeft: "10px",
                    }}
                  >
                    (Confidence: {Math.round(result.confidence)}%)
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
