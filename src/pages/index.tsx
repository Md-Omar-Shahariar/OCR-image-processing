// components/HomePage.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-6 font-mono relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 opacity-90 z-0"></div>
      <div className="fixed inset-0 bg-grid-pattern opacity-10 z-0"></div>

      {/* Animated Glow Lines */}
      <div className="fixed top-0 left-1/4 w-1/2 h-1 blur-md bg-cyan-500 opacity-30 animate-pulse z-0"></div>
      <div className="fixed bottom-0 left-1/3 w-1/3 h-1 blur-md bg-purple-500 opacity-30 animate-pulse z-0"></div>
      <div className="fixed top-1/2 right-0 w-1 h-32 blur-md bg-red-500 opacity-30 animate-pulse z-0"></div>

      {/* Floating Orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow z-0"></div>
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow z-0"></div>
      <div className="fixed top-1/2 left-1/2 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse-slow z-0"></div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        {/* Main Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-red-400 tracking-wider">
            <span className="text-cyan-300">{"{"}</span>
            OCR_VISION_SUITE
            <span className="text-cyan-300">{"}"}</span>
          </h1>
          <p className="text-gray-400 text-lg font-mono">
            ADVANCED_IMAGE_PROCESSING_SYSTEMS
          </p>
          <div className="h-1 w-80 mx-auto mt-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-red-500 shadow-lg shadow-cyan-500/30"></div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-12">
          {/* Full Page OCR Card */}
          <div
            className={`relative group cursor-pointer transition-all duration-500 ${
              hoveredButton === "fullpage" ? "scale-105" : "scale-100"
            }`}
            onMouseEnter={() => setHoveredButton("fullpage")}
            onMouseLeave={() => setHoveredButton(null)}
            onClick={() => navigateTo("/text-extractor")}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-300"></div>
            <div className="relative bg-gray-800 rounded-xl p-8 border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 h-full">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-cyan-300 mb-3 group-hover:text-cyan-200 transition-colors">
                  FULL_PAGE_OCR
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  Extract text from entire images with high accuracy. Supports
                  multiple file uploads, drag & drop, and batch processing with
                  real-time results.
                </p>
                <div className="space-y-2 text-xs text-cyan-600">
                  <div>• MULTI_FILE_UPLOAD</div>
                  <div>• DRAG_&_DROP_SUPPORT</div>
                  <div>• BATCH_PROCESSING</div>
                  <div>• REAL_TIME_RESULTS</div>
                </div>
              </div>
            </div>
            <div
              className={`absolute top-4 right-4 w-3 h-3 bg-cyan-400 rounded-full animate-pulse ${
                hoveredButton === "fullpage" ? "opacity-100" : "opacity-50"
              }`}
            ></div>
          </div>

          {/* Red Box OCR Card */}
          <div
            className={`relative group cursor-pointer transition-all duration-500 ${
              hoveredButton === "redbox" ? "scale-105" : "scale-100"
            }`}
            onMouseEnter={() => setHoveredButton("redbox")}
            onMouseLeave={() => setHoveredButton(null)}
            onClick={() => navigateTo("/redbox")}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-red-500 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-300"></div>
            <div className="relative bg-gray-800 rounded-xl p-8 border border-red-500/30 hover:border-red-400/50 transition-all duration-300 h-full">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-red-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-red-300 mb-3 group-hover:text-red-200 transition-colors">
                  RED_BOX_DETECTOR
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  Advanced computer vision system that detects red bounding
                  boxes and extracts text within them using OpenCV and Tesseract
                  OCR.
                </p>
                <div className="space-y-2 text-xs text-red-600">
                  <div>• OPENCV_INTEGRATION</div>
                  <div>• RED_BOX_DETECTION</div>
                  <div>• COMPUTER_VISION</div>
                  <div>• PRECISE_TEXT_EXTRACTION</div>
                </div>
              </div>
            </div>
            <div
              className={`absolute top-4 right-4 w-3 h-3 bg-red-400 rounded-full animate-pulse ${
                hoveredButton === "redbox" ? "opacity-100" : "opacity-50"
              }`}
            ></div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={() => navigateTo("/text-extractor")}
            className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-lg font-medium text-white hover:from-cyan-500 hover:to-purple-500 transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/40 flex items-center justify-center space-x-3"
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
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
              />
            </svg>
            <span>LAUNCH_FULL_PAGE_OCR</span>
          </button>

          <button
            onClick={() => navigateTo("/redbox")}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-red-600 rounded-lg font-medium text-white hover:from-purple-500 hover:to-red-500 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-red-400/40 flex items-center justify-center space-x-3"
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
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            <span>LAUNCH_RED_BOX_DETECTOR</span>
          </button>
        </div>

        {/* System Status */}
        <div className="text-center text-gray-500 text-sm font-mono">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>SYSTEM_OPERATIONAL</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <span>OCR_ENGINES_READY</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              <span>VISION_SYSTEMS_ACTIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .bg-grid-pattern {
          background-image: linear-gradient(
              rgba(6, 182, 212, 0.1) 1px,
              transparent 1px
            ),
            linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </main>
  );
}
