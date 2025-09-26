// components/RedBoxOCR.tsx

import { useRouter } from "next/navigation";
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
    cv: import("../../types/opencv").CV | null;
    isOpenCVLoading?: boolean;
    isOpenCVLoaded?: boolean;
  }
}

export default function RedBoxOCR() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [results, setResults] = useState<OCRResult[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("SYSTEM_READY");
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [scanLinePosition, setScanLinePosition] = useState(0);

  const goHome = () => {
    router.push("/");
  };

  // Animated scan line effect
  useEffect(() => {
    const interval = setInterval(() => {
      setScanLinePosition((prev) => (prev + 10) % 100);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Load OpenCV dynamically - FIXED VERSION
  useEffect(() => {
    const loadOpenCV = async (): Promise<void> => {
      // Check if OpenCV is already loaded
      if (typeof window !== "undefined" && window.cv && window.isOpenCVLoaded) {
        setStatus("OPENCV_LOADED");
        return;
      }

      // Check if OpenCV is currently loading
      if (window.isOpenCVLoading) {
        setStatus("OPENCV_LOADING_IN_PROGRESS");
        // Wait for loading to complete
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
        setStatus("LOADING_OPENCV...");
        window.isOpenCVLoading = true;

        await new Promise<void>((resolve, reject) => {
          // Check if script is already added
          const existingScript = document.querySelector(
            'script[src*="opencv.js"]'
          );
          if (existingScript) {
            // Script already exists, wait for it to load
            const checkCV = () => {
              if (window.cv && window.cv.Mat) {
                window.isOpenCVLoaded = true;
                window.isOpenCVLoading = false;
                setStatus("OPENCV_LOADED_SUCCESS");
                resolve();
              } else {
                setTimeout(checkCV, 100);
              }
            };
            checkCV();
            return;
          }

          // Create and add new script
          const script = document.createElement("script");
          script.src = "https://docs.opencv.org/4.8.0/opencv.js";
          script.async = true;
          script.onload = () => {
            const checkCV = () => {
              if (window.cv && window.cv.Mat) {
                window.isOpenCVLoaded = true;
                window.isOpenCVLoading = false;
                setStatus("OPENCV_LOADED_SUCCESS");
                resolve();
              } else {
                setTimeout(checkCV, 100);
              }
            };
            checkCV();
          };
          script.onerror = () => {
            window.isOpenCVLoading = false;
            reject(new Error("Failed to load OpenCV"));
          };
          document.head.appendChild(script);
        });
      } catch (error) {
        window.isOpenCVLoading = false;
        setStatus("OPENCV_LOAD_FAILED - USING_CANVAS_MODE");
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
    return [h, s, v, 0];
  };

  const handleImage = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setStatus("PROCESSING_IMAGE...");
    setResults([]);
    setOriginalImage(URL.createObjectURL(file));

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = async () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        setIsProcessing(false);
        setStatus("CANVAS_ERROR");
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsProcessing(false);
        setStatus("CONTEXT_ERROR");
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      try {
        let redBoxes: Box[] = [];
        const texts: OCRResult[] = [];

        // Wait for OpenCV to be fully loaded if it's still loading
        if (window.isOpenCVLoading && !window.isOpenCVLoaded) {
          setStatus("WAITING_FOR_OPENCV...");
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
          setStatus("OPENCV_DETECTION_ACTIVE");

          // OpenCV detection
          const src = window.cv.imread(canvas);
          const hsv = new window.cv.Mat();

          window.cv.cvtColor(src, hsv, window.cv.COLOR_RGBA2RGB);
          window.cv.cvtColor(hsv, hsv, window.cv.COLOR_RGB2HSV);

          const lowRed1 = new window.cv.Scalar(0, 100, 100, 0);
          const highRed1 = new window.cv.Scalar(10, 255, 255, 0);
          const lowRed2 = new window.cv.Scalar(160, 100, 100, 0);
          const highRed2 = new window.cv.Scalar(180, 255, 255, 0);

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

          // Cleanup
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
          setStatus("CANVAS_DETECTION_ACTIVE");
          redBoxes = detectRedBoxesWithCanvas(ctx, img.width, img.height);
        }

        setStatus(`DETECTED_${redBoxes.length}_RED_BOXES - RUNNING_OCR...`);

        // Perform OCR
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

            // Neon-style bounding boxes
            ctx.strokeStyle = "#ff00ff";
            ctx.lineWidth = 4;
            ctx.shadowColor = "#ff00ff";
            ctx.shadowBlur = 15;
            ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

            ctx.fillStyle = "#ff00ff";
            ctx.font = "bold 18px 'Courier New', monospace";
            ctx.shadowColor = "#ff00ff";
            ctx.shadowBlur = 10;
            ctx.fillText(`BOX_${i + 1}`, rect.x, rect.y - 10);
            ctx.shadowBlur = 0;
          } catch (error) {
            console.error(`OCR error for box ${i + 1}:`, error);
          }
        }

        await worker.terminate();
        setResults(texts);
        setStatus(`PROCESSING_COMPLETE - FOUND_${texts.length}_TEXT_ELEMENTS`);
      } catch (error) {
        console.error("Error processing image:", error);
        setStatus(
          `ERROR: ${error instanceof Error ? error.message : "UNKNOWN_ERROR"}`
        );
      } finally {
        setIsProcessing(false);
        URL.revokeObjectURL(img.src);
      }
    };

    img.onerror = () => {
      setIsProcessing(false);
      setStatus("IMAGE_LOAD_ERROR");
    };
  };

  return (
    <main className="min-h-screen bg-black text-cyan-300 p-6 font-mono relative overflow-hidden">
      {/* Cyberpunk Background Elements */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-purple-900 to-blue-900 z-0"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,rgba(120,119,198,0.3),rgba(255,255,255,0))] z-0"></div>

      {/* Animated Grid */}
      <div className="fixed inset-0 bg-grid-pattern opacity-20 z-0"></div>

      {/* Moving Scan Lines */}
      <div
        className="fixed inset-0 z-0 opacity-10"
        style={{
          background: `linear-gradient(to bottom, transparent 0%, rgba(0, 255, 255, 0.8) ${scanLinePosition}%, transparent 100%)`,
          backgroundSize: "100% 200px",
        }}
      ></div>

      {/* Neon Orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse-slow z-0"></div>
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse-slow delay-1000 z-0"></div>
      <div className="fixed top-1/2 left-1/2 w-64 h-64 bg-purple-500/15 rounded-full blur-2xl animate-pulse-slow delay-500 z-0"></div>

      {/* Binary Rain Effect */}
      <div className="fixed inset-0 bg-binary-rain opacity-30 z-0"></div>

      {/* Home Button */}
      <button
        onClick={goHome}
        className="fixed top-6 left-6 z-50 bg-black/80 backdrop-blur-md text-cyan-300 px-6 py-3 rounded-lg border border-cyan-500/50 hover:border-cyan-300 transition-all duration-300 neon-glow hover:neon-glow-intense group"
      >
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
          <span className="font-mono text-sm tracking-wider">
            RETURN_TO_MAINFRAME
          </span>
          <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse delay-1000"></div>
        </div>
      </button>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        {/* Cyberpunk Title */}
        <div className="text-center mb-12 relative">
          {/* Title Glow Effect */}
          <div className="absolute -inset-8 bg-cyan-500/20 blur-2xl rounded-full animate-pulse"></div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-6xl font-bold relative bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-pink-400 to-purple-400 tracking-widest neon-text">
            <span className="text-cyan-300 drop-shadow-neon">[</span>
            RED_BOX_SCANNER_v2.0
            <span className="text-cyan-300 drop-shadow-neon">]</span>
          </h1>

          {/* Subtitle */}
          <div className="h-1 w-80 mx-auto mt-6 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-lg shadow-cyan-400/50"></div>
          <p className="text-cyan-600 mt-3 text-sm font-mono tracking-wider glow-text">
            NEON_VISION_PATTERN_RECOGNITION
          </p>
        </div>

        {/* Main Cyberpunk Terminal */}
        <div className="w-full max-w-7xl bg-black/60 backdrop-blur-md rounded-xl border border-cyan-500/40 shadow-2xl shadow-cyan-500/30 p-8 mb-8 relative overflow-hidden neon-terminal">
          {/* Terminal Header */}
          <div className="flex items-center mb-8 pb-4 border-b border-cyan-500/40 relative">
            {/* Animated Header Glow */}
            <div className="absolute -inset-4 bg-cyan-500/10 blur-xl rounded-lg"></div>

            <div className="flex space-x-3 relative z-10">
              <div className="w-3 h-3 bg-red-400 rounded-full neon-dot"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full neon-dot delay-300"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full neon-dot delay-700"></div>
            </div>

            <div className="flex-1 text-center">
              <span className="text-cyan-300 font-mono text-lg tracking-wider glow-text">
                CYBER_OPTICAL_CHARACTER_RECOGNITION
              </span>
            </div>
          </div>

          {/* Upload Section */}
          <div className="mb-8">
            <label className="block text-cyan-300 font-mono text-sm mb-4 tracking-wider glow-text">
              UPLOAD_TARGET_IMAGE:
            </label>

            <label className="relative block cursor-pointer group">
              {/* Upload Card Glow */}
              <div className="absolute -inset-2 bg-cyan-500/20 blur-lg rounded-2xl group-hover:bg-cyan-400/30 transition-all duration-500"></div>

              <div className="relative border-2 border-dashed border-cyan-700 rounded-xl p-8 text-center group-hover:border-cyan-400 transition-all duration-300 neon-upload">
                <div className="relative z-10">
                  {/* Upload Icon */}
                  <div className="w-16 h-16 mx-auto mb-4 relative">
                    <div className="absolute inset-0 bg-cyan-400/20 rounded-full animate-ping"></div>
                    <div className="absolute inset-2 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center neon-icon">
                      <svg
                        className="w-8 h-8 text-black"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="text-cyan-300 font-mono text-xl mb-2 tracking-wider">
                    {isProcessing ? "PROCESSING..." : "DROP_ZONE_ACTIVE"}
                  </div>
                  <div className="text-cyan-600 text-sm font-mono tracking-wider">
                    SUPPORTED_FORMATS: JPG/PNG/BMP
                  </div>
                </div>
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
                disabled={isProcessing}
                className="hidden"
              />
            </label>
          </div>

          {/* Status Display */}
          <div className="mb-8">
            <div className="bg-black/50 rounded-xl p-6 border border-cyan-500/30 relative neon-status">
              <div className="flex items-center space-x-4">
                <div
                  className={`w-3 h-3 rounded-full neon-status-dot ${
                    isProcessing
                      ? "bg-yellow-400 animate-pulse"
                      : "bg-green-400"
                  }`}
                ></div>
                <span className="text-cyan-300 font-mono text-base tracking-wider">
                  SYSTEM_STATUS: <span className="text-cyan-100">{status}</span>
                </span>
              </div>

              {isProcessing && (
                <div className="mt-4">
                  <div className="w-full bg-cyan-900/30 rounded-full h-3 overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-400 h-3 rounded-full animate-progress"></div>
                  </div>
                  <div className="text-cyan-500 text-xs mt-2 font-mono tracking-wider text-center">
                    ANALYZING_IMAGE_DATA - PLEASE_STANDBY...
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results Section - Side by Side */}
          {(originalImage || results.length > 0) && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
              {/* Image Panel */}
              <div className="space-y-4">
                <div className="flex items-center pb-3 border-b border-cyan-500/40">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-pulse neon-dot"></div>
                  <h3 className="text-cyan-300 font-mono text-xl tracking-wider glow-text">
                    VISUAL_ANALYSIS
                  </h3>
                </div>

                <div className="relative bg-black/80 rounded-xl border border-cyan-500/30 p-3 neon-panel">
                  {originalImage && (
                    <div className="relative overflow-hidden rounded-lg">
                      <img
                        src={originalImage}
                        alt="Original"
                        className="w-full h-auto rounded-lg"
                      />
                      <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full rounded-lg"
                        style={{
                          display: results.length > 0 ? "block" : "none",
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Text Results Panel */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-pink-500/40">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-pink-400 rounded-full mr-3 animate-pulse neon-dot"></div>
                    <h3 className="text-pink-300 font-mono text-xl tracking-wider glow-text">
                      TEXT_EXTRACTION
                    </h3>
                  </div>
                  {results.length > 0 && (
                    <span className="text-pink-500 text-sm font-mono tracking-wider neon-badge">
                      {results.length}_ELEMENTS
                    </span>
                  )}
                </div>

                <div className="h-auto overflow-y-auto terminal-scroll bg-black/60 rounded-xl border border-pink-500/30 p-4 neon-panel">
                  {results.length > 0 ? (
                    <div className="space-y-4">
                      {results.map((result, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-r from-pink-500/10 to-cyan-500/5 rounded-xl p-1 border border-pink-500/20 neon-result"
                        >
                          <div className="bg-black/80 rounded-xl p-4">
                            {/* Result Header */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-pink-400 rounded-full animate-pulse"></div>
                                <span className="text-cyan-300 font-mono font-bold tracking-wider text-lg">
                                  BOX_{index + 1}
                                </span>
                              </div>
                              {result.confidence && (
                                <span className="text-pink-400 text-xs font-mono tracking-wider neon-confidence">
                                  CONF: {Math.round(result.confidence)}%
                                </span>
                              )}
                            </div>

                            {/* Extracted Text */}
                            <div className="bg-black/50 rounded-lg p-4 border border-cyan-500/10 mb-2">
                              <pre className="text-cyan-200 font-mono text-base tracking-wide whitespace-pre-wrap neon-text-content">
                                {result.text}
                              </pre>
                            </div>

                            {/* Position Data */}
                            <div className="text-cyan-600 text-xs font-mono tracking-wider">
                              COORDINATES: X{result.box.x} Y{result.box.y} |
                              DIM: W{result.box.width} H{result.box.height}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-cyan-600 font-mono tracking-wider text-lg">
                      {isProcessing
                        ? "SCANNING_FOR_TEXT..."
                        : "AWAITING_IMAGE_ANALYSIS"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!originalImage && results.length === 0 && (
            <div className="text-center py-16 text-cyan-600 font-mono tracking-wider text-lg neon-empty">
              UPLOAD_IMAGE_TO_INITIATE_NEON_SCAN
            </div>
          )}
        </div>

        {/* System Footer */}
      </div>

      {/* Global Cyberpunk Styles */}
      <style jsx global>{`
        .bg-grid-pattern {
          background-image: linear-gradient(
              rgba(0, 255, 255, 0.1) 1px,
              transparent 1px
            ),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        .bg-binary-rain {
          background: linear-gradient(
            transparent 90%,
            rgba(0, 255, 255, 0.1) 100%
          );
          background-size: 100% 10px;
          animation: binaryRain 1s linear infinite;
        }

        @keyframes binaryRain {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 0 10px;
          }
        }

        .neon-text {
          text-shadow: 0 0 5px currentColor, 0 0 10px currentColor,
            0 0 15px currentColor, 0 0 20px currentColor;
        }

        .glow-text {
          text-shadow: 0 0 10px rgba(0, 255, 255, 0.7);
        }

        .neon-glow {
          box-shadow: 0 0 5px rgba(0, 255, 255, 0.5),
            0 0 10px rgba(0, 255, 255, 0.3),
            inset 0 0 10px rgba(0, 255, 255, 0.1);
        }

        .neon-glow-intense {
          box-shadow: 0 0 15px rgba(0, 255, 255, 0.8),
            0 0 30px rgba(0, 255, 255, 0.5),
            inset 0 0 20px rgba(0, 255, 255, 0.2);
        }

        .neon-terminal {
          box-shadow: 0 0 30px rgba(0, 255, 255, 0.3),
            0 0 60px rgba(0, 255, 255, 0.1),
            inset 0 0 30px rgba(0, 255, 255, 0.05);
        }

        .neon-upload {
          box-shadow: 0 0 20px rgba(0, 255, 255, 0.2),
            inset 0 0 20px rgba(0, 255, 255, 0.1);
        }

        .neon-status {
          box-shadow: 0 0 15px rgba(0, 255, 255, 0.2),
            inset 0 0 15px rgba(0, 255, 255, 0.1);
        }

        .neon-panel {
          box-shadow: 0 0 20px rgba(0, 255, 255, 0.15),
            inset 0 0 20px rgba(0, 255, 255, 0.05);
        }

        .neon-result {
          box-shadow: 0 0 10px rgba(255, 0, 255, 0.3),
            0 0 20px rgba(255, 0, 255, 0.1);
        }

        .neon-dot {
          box-shadow: 0 0 10px currentColor;
        }

        .neon-icon {
          box-shadow: 0 0 20px rgba(0, 255, 255, 0.5),
            0 0 40px rgba(0, 255, 255, 0.3);
        }

        .neon-badge {
          text-shadow: 0 0 5px rgba(255, 0, 255, 0.7);
        }

        .neon-confidence {
          text-shadow: 0 0 5px rgba(255, 0, 255, 0.5);
        }

        .neon-text-content {
          text-shadow: 0 0 3px rgba(0, 255, 255, 0.5);
        }

        .neon-empty {
          text-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
        }

        .terminal-scroll::-webkit-scrollbar {
          width: 8px;
        }

        .terminal-scroll::-webkit-scrollbar-track {
          background: rgba(0, 255, 255, 0.1);
          border-radius: 4px;
        }

        .terminal-scroll::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 255, 0.3);
          border-radius: 4px;
        }

        .terminal-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 255, 0.5);
        }

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes progress {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }

        canvas {
          max-width: 100%;
          height: auto;
          pointer-events: none;
        }

        .drop-shadow-neon {
          filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.7));
        }
      `}</style>
    </main>
  );
}
