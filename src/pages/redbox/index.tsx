import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { createWorker } from "tesseract.js";
import { withAuth } from "../../components/withAuth";
import AppShell from "../../components/layout/AppShell";
import PageHeaderCard from "../../components/ui/PageHeaderCard";
import ProgressBar from "../../components/ui/ProgressBar";
import { themeColors } from "@/lib/theme";

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cv: any;
    isOpenCVLoading?: boolean;
    isOpenCVLoaded?: boolean;
  }
}

function RedBoxScanner() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [results, setResults] = useState<OCRResult[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("Ready to scan images");
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const theme = themeColors.redfox;
  const downloadTextFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadBoxResult = (result: OCRResult, index: number) => {
    const content = [
      `Box ${index + 1}`,
      `Text: ${result.text || "No text"}`,
      `Position: X${result.box.x}, Y${result.box.y}`,
      `Size: ${result.box.width}x${result.box.height}px`,
      result.confidence
        ? `Confidence: ${Math.round(result.confidence)}%`
        : undefined,
    ]
      .filter(Boolean)
      .join("\n");
    downloadTextFile(content, `redbox_${index + 1}.txt`);
  };

  const downloadAllResults = () => {
    if (results.length === 0) {
      return;
    }
    const content = results
      .map((result, index) => {
        const lines = [
          `Box ${index + 1}`,
          `Text: ${result.text || "No text"}`,
          `Position: X${result.box.x}, Y${result.box.y}`,
          `Size: ${result.box.width}x${result.box.height}px`,
          result.confidence
            ? `Confidence: ${Math.round(result.confidence)}%`
            : undefined,
        ];
        return lines.filter(Boolean).join("\n");
      })
      .join("\n\n");
    downloadTextFile(content, `redbox_results.txt`);
  };
  const downloadButtonClass =
    theme.downloadButton || "bg-red-100 hover:bg-red-200 text-red-700";

  const goHome = () => {
    router.push("/");
  };

  // Simulate upload progress
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    if (isProcessing) {
      setUploadProgress(0);
      progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
    } else {
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1000);
    }
    return () => clearInterval(progressInterval);
  }, [isProcessing]);

  // Load OpenCV dynamically
  useEffect(() => {
    const loadOpenCV = async (): Promise<void> => {
      if (typeof window !== "undefined" && window.cv && window.isOpenCVLoaded) {
        setStatus("Computer vision engine ready");
        return;
      }

      if (window.isOpenCVLoading) {
        setStatus("Loading computer vision engine...");
        await new Promise<void>((resolve) => {
          const checkLoaded = () => {
            if (window.isOpenCVLoaded) {
              resolve();
            } else {
              setTimeout(checkLoaded, 100);
            }
          };
          checkLoaded();
        });
        return;
      }

      try {
        setStatus("Initializing computer vision...");
        window.isOpenCVLoading = true;

        await new Promise<void>((resolve, reject) => {
          const existingScript = document.querySelector(
            'script[src*="opencv.js"]'
          );
          if (existingScript) {
            const checkCV = () => {
              if (window.cv && window.cv.Mat) {
                window.isOpenCVLoaded = true;
                window.isOpenCVLoading = false;
                setStatus("Computer vision engine loaded");
                resolve();
              } else {
                setTimeout(checkCV, 100);
              }
            };
            checkCV();
            return;
          }

          const script = document.createElement("script");
          script.src = "https://docs.opencv.org/4.8.0/opencv.js";
          script.async = true;
          script.onload = () => {
            const checkCV = () => {
              if (window.cv && window.cv.Mat) {
                window.isOpenCVLoaded = true;
                window.isOpenCVLoading = false;
                setStatus("Computer vision engine loaded");
                resolve();
              } else {
                setTimeout(checkCV, 100);
              }
            };
            checkCV();
          };
          script.onerror = () => {
            window.isOpenCVLoading = false;
            reject(new Error("Failed to load computer vision engine"));
          };
          document.head.appendChild(script);
        });
      } catch (error) {
        window.isOpenCVLoading = false;
        setStatus("Using basic detection mode");
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

    for (let y = 0; y < height; y += 2) {
      for (let x = 0; x < width; x += 2) {
        const index = (y * width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];

        if (r > 150 && g < 100 && b < 100 && r > g + 50 && r > b + 50) {
          const pos = `${x},${y}`;
          if (!visited.has(pos)) {
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
    return [h, s, v, 0];
  };

  const handleImage = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setStatus("Processing image...");
    setResults([]);
    setOriginalImage(URL.createObjectURL(file));

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = async () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        setIsProcessing(false);
        setStatus("Canvas error");
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsProcessing(false);
        setStatus("Context error");
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      try {
        let redBoxes: Box[] = [];
        const texts: OCRResult[] = [];

        if (window.isOpenCVLoading && !window.isOpenCVLoaded) {
          setStatus("Waiting for computer vision engine...");
          await new Promise<void>((resolve) => {
            const checkLoaded = () => {
              if (window.isOpenCVLoaded) {
                resolve();
              } else {
                setTimeout(checkLoaded, 100);
              }
            };
            checkLoaded();
          });
        }

        if (window.cv && window.cv.Mat && window.isOpenCVLoaded) {
          setStatus("Detecting red boxes with computer vision...");

          const src = window.cv.imread(canvas);
          const hsv = new window.cv.Mat();

          window.cv.cvtColor(src, hsv, window.cv.COLOR_RGBA2RGB);
          window.cv.cvtColor(hsv, hsv, window.cv.COLOR_RGB2HSV);

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

          [
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
          ].forEach((mat) => mat && !mat.isDeleted && mat.delete());
        } else {
          setStatus("Detecting red boxes with basic detection...");
          redBoxes = detectRedBoxesWithCanvas(ctx, img.width, img.height);
        }

        setStatus(`Found ${redBoxes.length} red boxes - extracting text...`);

        const worker = await createWorker("jpn");

        for (let i = 0; i < redBoxes.length; i++) {
          const rect = redBoxes[i];
          const roiCanvas = document.createElement("canvas");
          roiCanvas.width = Math.max(rect.width, 1);
          roiCanvas.height = Math.max(rect.height, 1);
          const roiCtx = roiCanvas.getContext("2d");

          if (!roiCtx || rect.width <= 0 || rect.height <= 0) continue;

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
            const { data } = await worker.recognize(roiCanvas);
            if (data.text.trim()) {
              texts.push({
                box: rect,
                text: data.text.trim(),
                confidence: data.confidence,
              });
            }

            // Draw bounding boxes
            ctx.strokeStyle = "#ef4444";
            ctx.lineWidth = 3;
            ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

            ctx.fillStyle = "#ef4444";
            ctx.font = "bold 16px system-ui";
            ctx.fillText(`Box ${i + 1}`, rect.x, rect.y - 10);
          } catch (error) {
            console.error(`OCR error for box ${i + 1}:`, error);
          }
        }

        await worker.terminate();
        setResults(texts);
        setStatus(`Complete! Extracted text from ${texts.length} boxes`);
      } catch (error) {
        console.error("Error processing image:", error);
        setStatus(
          `Error: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      } finally {
        setIsProcessing(false);
        URL.revokeObjectURL(img.src);
      }
    };

    img.onerror = () => {
      setIsProcessing(false);
      setStatus("Failed to load image");
    };
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <AppShell
      gradient={theme.pageGradient}
      overlay={
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-100 to-transparent animate-pulse"></div>
        </div>
      }
    >
      <div className="relative z-10">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 pt-8 pb-4">
          <PageHeaderCard
            onBack={goHome}
            title="Red Box Scanner"
            subtitle="Advanced Computer Vision"
            stats={[
              { label: "Detection mode", value: "Red ROI" },
              { label: "Engines", value: "OpenCV + Tesseract" },
            ]}
          />

          {/* Main Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 overflow-hidden mb-8">
            {/* Header Section */}
            <div className={`${theme.headerGradient} p-8 relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>

              <div className="relative z-10">
                <h1 className="text-4xl font-bold text-white mb-4">
                  Red Box Text Scanner
                </h1>
                <p className="text-red-100 text-lg max-w-2xl">
                  Automatically detect red bounding boxes and extract text using
                  advanced computer vision and OCR
                </p>
              </div>
            </div>

            {/* Upload Section */}
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Upload Area */}
                <div>
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-3">
                      Upload Image
                    </h2>
                    <p className="text-slate-600">
                      Upload an image containing red bounding boxes. Our AI will
                      detect them and extract the text inside.
                    </p>
                  </div>

                  {/* Drop Zone */}
                  <div
                    className={`relative border-3 border-dashed rounded-2xl p-8 text-center transition-all duration-500 cursor-pointer mb-6 group ${
                      isProcessing ? theme.dropzoneActive : theme.dropzoneIdle
                    }`}
                    onClick={triggerFileInput}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImage}
                      disabled={isProcessing}
                      ref={fileInputRef}
                      className="hidden"
                    />

                    <div className="max-w-md mx-auto">
                      <div
                        className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-r ${theme.dropzoneAccent} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                      >
                        <svg
                          className="w-10 h-10 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>

                      <h3 className="text-xl font-semibold text-slate-800 mb-3">
                        {isProcessing
                          ? "🔄 Processing image..."
                          : "📁 Drop image here or click to browse"}
                      </h3>

                      <p className="text-slate-500 text-sm mb-4">
                        Supports JPG, PNG, BMP • Maximum 1MB
                      </p>

                      <div className="inline-flex items-center space-x-2 bg-slate-100 rounded-full px-4 py-2">
                        <svg
                          className="w-4 h-4 text-slate-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-slate-600 text-sm">
                          Perfect for documents with red highlights
                        </span>
                      </div>
                    </div>
                  </div>

                  {isProcessing && (
                    <ProgressBar
                      value={uploadProgress}
                      label="Processing image..."
                      accentClass={theme.dropzoneAccent}
                    />
                  )}

                  {/* Status Display */}
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          isProcessing
                            ? "bg-yellow-500 animate-pulse"
                            : "bg-green-500"
                        }`}
                      ></div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800">
                          Status
                        </div>
                        <div className="text-slate-600 text-sm">{status}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Tips & Info */}
                <div>
                  {/* Tips Card */}
                  <div className={`${theme.tipsWrapper} mb-8`}>
                    <h4
                      className={`font-semibold ${theme.tipsTitle} mb-3 flex items-center space-x-2`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Best Practices</span>
                    </h4>
                    <ul className={`space-y-2 text-sm ${theme.tipsText}`}>
                      <li className="flex items-center space-x-2">
                        <div className={`w-1.5 h-1.5 ${theme.tipsBullet} rounded-full`}></div>
                        <span>Use clear images with distinct red boxes</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className={`w-1.5 h-1.5 ${theme.tipsBullet} rounded-full`}></div>
                        <span>
                          Ensure good contrast between text and background
                        </span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className={`w-1.5 h-1.5 ${theme.tipsBullet} rounded-full`}></div>
                        <span>Red boxes should be clearly visible</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className={`w-1.5 h-1.5 ${theme.tipsBullet} rounded-full`}></div>
                        <span>Text inside boxes should be readable</span>
                      </li>
                    </ul>
                  </div>

                  {/* Features Card */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <h4 className="font-semibold text-slate-800 mb-4">
                      How It Works
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                          <span className="text-red-600 font-bold text-sm">
                            1
                          </span>
                        </div>
                        <span className="text-slate-600 text-sm">
                          Upload your image
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <span className="text-orange-600 font-bold text-sm">
                            2
                          </span>
                        </div>
                        <span className="text-slate-600 text-sm">
                          AI detects red bounding boxes
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                          <span className="text-amber-600 font-bold text-sm">
                            3
                          </span>
                        </div>
                        <span className="text-slate-600 text-sm">
                          OCR extracts text from each box
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <span className="text-green-600 font-bold text-sm">
                            4
                          </span>
                        </div>
                        <span className="text-slate-600 text-sm">
                          Get structured results
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          {(originalImage || results.length > 0) && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
              {/* Image Panel */}
              <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6">
                  <h2 className="text-xl font-bold text-white flex items-center space-x-3">
                    <span>🖼️ Visual Analysis</span>
                  </h2>
                </div>
                <div className="p-6">
                  {originalImage && (
                    <div className="relative bg-slate-50 rounded-2xl p-4 border border-slate-200">
                      <div className="relative overflow-hidden rounded-lg">
                        <Image
                          src={originalImage}
                          alt="Original"
                          width={1200}
                          height={800}
                          className="w-full h-auto rounded-lg shadow-sm"
                          unoptimized
                        />
                        <canvas
                          ref={canvasRef}
                          className="absolute inset-0 w-full h-full rounded-lg"
                          style={{
                            display: results.length > 0 ? "block" : "none",
                          }}
                        />
                      </div>
                      {results.length > 0 && (
                        <div className="mt-4 text-center text-slate-600 text-sm">
                          Detected {results.length} red box
                          {results.length > 1 ? "es" : ""}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Text Results Panel */}
              <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                <div className={`bg-gradient-to-r from-green-600 to-emerald-600 p-6`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center space-x-3">
                      <span>📋 Extracted Text</span>
                    </h2>
                    {results.length > 0 && (
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                          <span className="text-white font-semibold text-sm">
                            {results.length} box{results.length > 1 ? "es" : ""}
                          </span>
                        </div>
                        <button
                          onClick={downloadAllResults}
                          className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold ${downloadButtonClass}`}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 5v14m0 0l-4-4m4 4l4-4"
                            />
                          </svg>
                          <span>Download all</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  {results.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {results.map((result, index) => (
                        <div
                          key={index}
                          className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-red-200 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                                <span className="text-red-600 font-bold">
                                  {index + 1}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-semibold text-slate-800">
                                  Box {index + 1}
                                </h3>
                                {result.confidence && (
                                  <div className="text-slate-500 text-sm">
                                    Confidence: {Math.round(result.confidence)}%
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => copyToClipboard(result.text)}
                                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 text-sm"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                  />
                                </svg>
                                <span>Copy</span>
                              </button>
                              <button
                                onClick={() => downloadBoxResult(result, index)}
                                className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-semibold ${downloadButtonClass}`}
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 5v14m0 0l-4-4m4 4l4-4"
                                  />
                                </svg>
                                <span>Download</span>
                              </button>
                            </div>
                          </div>

                          <div className="bg-white rounded-xl p-4 border border-slate-200">
                            <pre className="text-slate-700 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                              {result.text}
                            </pre>
                          </div>

                          <div className="mt-3 text-slate-500 text-xs">
                            Position: X{result.box.x}, Y{result.box.y} • Size:{" "}
                            {result.box.width}×{result.box.height}px
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-96 flex flex-col items-center justify-center text-slate-500">
                      <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                        <svg
                          className="w-12 h-12 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 20c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z"
                          />
                        </svg>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-slate-600 mb-2">
                          No red boxes detected
                        </div>
                        <div className="text-sm">
                          Try uploading an image with clear red bounding boxes
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!originalImage && results.length === 0 && (
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-red-100 to-orange-100 rounded-3xl flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">
                Ready to Scan Red Boxes
              </h3>
              <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto">
                Upload an image with red bounding boxes to automatically detect
                and extract text using computer vision.
              </p>
              <div className="inline-flex items-center space-x-2 bg-slate-100 rounded-full px-4 py-2">
                <span className="text-slate-600">
                  ✨ Perfect for documents, forms, and marked images
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center py-8">
          <div className="inline-flex flex-wrap justify-center gap-6 bg-white/80 backdrop-blur-md rounded-2xl px-8 py-6 border border-white/50 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <div className="text-sm font-semibold text-slate-800">
                  Computer Vision
                </div>
                <div className="text-xs text-slate-500">Active</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div>
                <div className="text-sm font-semibold text-slate-800">
                  Red Box Detection
                </div>
                <div className="text-xs text-slate-500">Ready</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <div className="text-sm font-semibold text-slate-800">
                  OCR Engine
                </div>
                <div className="text-xs text-slate-500">Online</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default withAuth(RedBoxScanner);
