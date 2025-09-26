import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

interface FileResult {
  name: string;
  text: string;
  status: "success" | "error";
}

export default function FullPageExtractor() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<FileResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [scanLinePosition, setScanLinePosition] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Animated scan line effect
  useEffect(() => {
    const interval = setInterval(() => {
      setScanLinePosition((prev) => (prev + 10) % 100);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const goHome = () => {
    router.push("/");
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;

    setResults([]);
    setProcessing(true);

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", "jpn");

      try {
        const res = await fetch("/api/process-image", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        setResults((prev) => [
          ...prev,
          {
            name: file.name,
            text: data.status === "success" ? data.text : data.message,
            status: data.status === "success" ? "success" : "error",
          },
        ]);
      } catch (err) {
        setResults((prev) => [
          ...prev,
          { name: file.name, text: "Error uploading file", status: "error" },
        ]);
      }
    }

    // All files processed
    setProcessing(false);
    setFiles([]);

    // Show success tick for 2 seconds
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    const imageFiles = droppedFiles.filter((file) =>
      file.type.startsWith("image/")
    );
    if (imageFiles.length > 0) setFiles(imageFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
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
          <span className="font-mono text-sm tracking-wider">Home</span>
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
            OCR_IMAGE_PROCESSOR_v2.0
            <span className="text-cyan-300 drop-shadow-neon">]</span>
          </h1>

          {/* Subtitle */}
          <div className="h-1 w-80 mx-auto mt-6 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-lg shadow-cyan-400/50"></div>
          <p className="text-cyan-600 mt-3 text-sm font-mono tracking-wider glow-text">
            BATCH_FILE_PROCESSING_SYSTEM
          </p>
        </div>

        {/* Main Cyberpunk Terminal */}
        <div className="w-full max-w-4xl bg-black/60 backdrop-blur-md rounded-xl border border-cyan-500/40 shadow-2xl shadow-cyan-500/30 p-8 mb-8 relative overflow-hidden neon-terminal">
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
                MULTI_FILE_OCR_PROCESSOR
              </span>
            </div>

            <div className="text-cyan-600 text-xs font-mono tracking-wider">
              SYSTEM_v2.3.7
            </div>
          </div>

          {/* Upload Section */}
          <div className="mb-8">
            <label className="block text-cyan-300 font-mono text-sm mb-4 tracking-wider glow-text">
              UPLOAD_TARGET_FILES:
            </label>

            {/* Drop Zone */}
            <div
              className={`relative block cursor-pointer group mb-6 ${
                isDragging ? "neon-glow-intense" : ""
              }`}
            >
              {/* Upload Card Glow */}
              <div className="absolute -inset-2 bg-cyan-500/20 blur-lg rounded-2xl group-hover:bg-cyan-400/30 transition-all duration-500"></div>

              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 neon-upload ${
                  isDragging
                    ? "border-cyan-400 bg-cyan-900/20"
                    : "border-cyan-700 hover:border-cyan-500"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerFileInput}
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  ref={fileInputRef}
                  className="hidden"
                />
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
                    {files.length > 0
                      ? `${files.length}_FILES_SELECTED`
                      : processing
                      ? "PROCESSING..."
                      : "DROP_ZONE_ACTIVE"}
                  </div>
                  <div className="text-cyan-600 text-sm font-mono tracking-wider">
                    SUPPORTED_FORMATS: JPG/PNG/BMP
                  </div>
                </div>
              </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="w-full space-y-3 max-h-40 overflow-y-auto mt-4 terminal-scroll">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gradient-to-r from-cyan-500/10 to-purple-500/5 rounded-xl p-1 border border-cyan-500/20 neon-result"
                  >
                    <div className="bg-black/80 rounded-xl p-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-cyan-300 text-sm font-mono tracking-wider truncate max-w-xs">
                          {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(index);
                          }}
                          className="text-cyan-700 hover:text-cyan-400 transition-colors font-mono text-lg px-2"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            <button
              type="submit"
              disabled={processing || files.length === 0}
              onClick={handleUpload}
              className={`w-full py-4 px-6 rounded-lg font-mono text-lg tracking-wider transition-all duration-300 flex items-center justify-center mt-6 ${
                processing || files.length === 0
                  ? "bg-cyan-900/30 cursor-not-allowed text-cyan-700 border border-cyan-700/30"
                  : "bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/40 text-gray-900 font-bold"
              } neon-glow`}
            >
              {processing ? (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                  <span>PROCESSING_FILES...</span>
                  <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-300"></div>
                </div>
              ) : (
                "UPLOAD_&_EXTRACT_TEXT"
              )}
            </button>
          </div>

          {/* Result Section */}
          {results.length > 0 && (
            <section className="w-full bg-black/60 backdrop-blur-md rounded-xl border border-purple-500/40 shadow-2xl shadow-purple-500/30 p-6 mt-8 neon-panel">
              <div className="flex items-center justify-between pb-4 border-b border-purple-500/40 mb-6">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-pink-400 rounded-full mr-3 animate-pulse neon-dot"></div>
                  <h2 className="text-cyan-300 font-mono text-2xl tracking-wider glow-text">
                    OCR_RESULTS
                  </h2>
                </div>
                <span className="text-pink-500 text-sm font-mono tracking-wider neon-badge">
                  {results.length}_FILES_PROCESSED
                </span>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto terminal-scroll pr-2">
                {results.map((r, idx) => (
                  <div
                    key={idx}
                    className={`bg-gradient-to-r rounded-xl p-1 border-l-4 neon-result ${
                      r.status === "error"
                        ? "from-red-500/10 to-pink-500/5 border-red-500"
                        : "from-cyan-500/10 to-purple-500/5 border-cyan-500"
                    }`}
                  >
                    <div className="bg-black/80 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h3
                          className={`font-mono text-lg font-bold tracking-wider ${
                            r.status === "error"
                              ? "text-red-400"
                              : "text-cyan-300"
                          }`}
                        >
                          {r.name}
                        </h3>
                        <span
                          className={`text-xs font-mono tracking-wider px-2 py-1 rounded ${
                            r.status === "error"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-cyan-500/20 text-cyan-400"
                          }`}
                        >
                          {r.status === "error" ? "ERROR" : "SUCCESS"}
                        </span>
                      </div>
                      <div
                        className={`p-4 rounded-md border ${
                          r.status === "error"
                            ? "bg-red-900/20 border-red-500/30"
                            : "bg-cyan-900/20 border-cyan-500/30"
                        }`}
                      >
                        <pre className="whitespace-pre-wrap break-words text-cyan-200 font-mono text-sm tracking-wide neon-text-content">
                          {r.text}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {!processing && results.length === 0 && files.length === 0 && (
            <div className="text-center py-12 text-cyan-600 font-mono tracking-wider text-lg neon-empty">
              SELECT_FILES_TO_INITIATE_BATCH_PROCESSING
            </div>
          )}
        </div>

        {/* System Footer */}
        <div className="text-center text-cyan-600 text-sm font-mono tracking-wider mt-8">
          <div className="space-y-1">
            <div>BATCH_PROCESSING_SYSTEM v2.3.7 | CYBERSCAN_ACTIVE</div>
            <div>MODE: MULTI_FILE_OCR_PROCESSOR</div>
          </div>
        </div>
      </div>

      {/* Enhanced Blue Tick Popup */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="relative w-64 h-64">
            {/* Outer Glow Ring */}
            <div className="absolute inset-0 rounded-full bg-cyan-500/30 animate-ping-slow"></div>

            {/* Cyberpunk Hexagon */}
            <svg
              className="absolute inset-0 w-full h-full text-cyan-400 animate-pulse"
              viewBox="0 0 100 100"
            >
              <polygon
                points="50,5 85,25 85,75 50,95 15,75 15,25"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="5,3"
              />
            </svg>

            {/* Inner Hexagon with Neon Glow */}
            <svg
              className="absolute inset-0 m-auto w-40 h-40 text-cyan-500"
              viewBox="0 0 100 100"
            >
              <polygon
                points="50,15 75,30 75,70 50,85 25,70 25,30"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                style={{
                  filter: "drop-shadow(0 0 10px rgba(0, 255, 255, 0.8))",
                }}
              />
            </svg>

            {/* Animated Blue Tick */}
            <svg
              className="absolute inset-0 m-auto w-24 h-24 text-cyan-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              viewBox="0 0 24 24"
              style={{ filter: "drop-shadow(0 0 15px rgba(0, 255, 255, 1))" }}
            >
              <path
                d="M5 13l4 4L19 7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* Enhanced Glowing Particles */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 bg-cyan-400 rounded-full animate-float"
                style={{
                  top: `${50 + 40 * Math.sin((i * Math.PI) / 4)}%`,
                  left: `${50 + 40 * Math.cos((i * Math.PI) / 4)}%`,
                  animationDelay: `${i * 0.15}s`,
                  filter: "drop-shadow(0 0 8px rgba(0, 255, 255, 0.9))",
                }}
              ></div>
            ))}

            {/* Success Text */}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-cyan-400 font-mono tracking-wider text-lg glow-text whitespace-nowrap">
              PROCESSING_COMPLETE
            </div>
          </div>
        </div>
      )}

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

        @keyframes float {
          0%,
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          50% {
            transform: translateY(-20px) scale(1.2);
            opacity: 0.7;
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }

        .animate-float {
          animation: float 2s ease-in-out infinite;
        }

        .drop-shadow-neon {
          filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.7));
        }

        @keyframes ping-slow {
          0% {
            transform: scale(0.8);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.5;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }

        .animate-ping-slow {
          animation: ping-slow 2s ease-out forwards;
        }
      `}</style>
    </main>
  );
}
