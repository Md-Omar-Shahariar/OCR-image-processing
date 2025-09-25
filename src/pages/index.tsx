import { useState, useRef } from "react";

interface FileResult {
  name: string;
  text: string;
  status: "success" | "error";
}

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<FileResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <main className="min-h-screen bg-gray-900 text-cyan-300 p-6 font-mono relative">
      {/* Backgrounds */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 opacity-90 z-0"></div>
      <div className="fixed inset-0 bg-grid-pattern opacity-10 z-0"></div>
      <div className="fixed top-0 left-1/4 w-1/2 h-1 blur-md bg-cyan-500 opacity-30 animate-pulse z-0"></div>
      <div className="fixed bottom-0 left-1/3 w-1/3 h-1 blur-md bg-purple-500 opacity-30 animate-pulse z-0"></div>

      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-8 mt-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 tracking-tight">
          <span className="text-cyan-300">[</span>
          OCR IMAGE PROCESSOR
          <span className="text-cyan-300">]</span>
        </h1>

        {/* Upload Card */}
        <div className="w-full max-w-2xl bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl border border-cyan-500 border-opacity-30 shadow-2xl shadow-cyan-500/20 p-6 mb-8">
          <form
            onSubmit={handleUpload}
            className="flex flex-col items-center space-y-6"
          >
            {/* Drop Zone */}
            <div
              className={`w-full h-48 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                isDragging
                  ? "border-cyan-400 bg-cyan-900 bg-opacity-20 shadow-lg shadow-cyan-400/30"
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
              <div className="text-center p-4">
                <p className="text-cyan-300 font-medium">
                  {files.length > 0
                    ? `${files.length} file(s) selected`
                    : "Drag & drop images here"}
                </p>
                <p className="text-cyan-600 text-sm mt-2">
                  or{" "}
                  <span className="text-cyan-400 underline">browse files</span>
                </p>
              </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="w-full space-y-2 max-h-40 overflow-y-auto mt-4">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-700 bg-opacity-50 rounded-md px-3 py-2"
                  >
                    <span className="text-cyan-300 text-sm truncate max-w-xs">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="text-cyan-700 hover:text-cyan-500 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            <button
              type="submit"
              disabled={processing || files.length === 0}
              className={`w-full py-3 px-6 rounded-lg font-medium text-gray-900 transition-all duration-300 flex items-center justify-center ${
                processing || files.length === 0
                  ? "bg-cyan-800 bg-opacity-30 cursor-not-allowed text-cyan-700"
                  : "bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/40"
              }`}
            >
              {processing ? "PROCESSING..." : "UPLOAD & EXTRACT TEXT"}
            </button>
          </form>
        </div>

        {/* Result Section */}
        {results.length > 0 && (
          <section className="w-full max-w-4xl bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl border border-purple-500 border-opacity-30 shadow-2xl shadow-purple-500/20 p-6">
            <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              OCR RESULTS
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {results.map((r, idx) => (
                <div
                  key={idx}
                  className={`bg-gray-700 bg-opacity-50 rounded-xl p-5 border-l-4 ${
                    r.status === "error" ? "border-red-500" : "border-cyan-500"
                  } shadow-md`}
                >
                  <h3
                    className={`font-semibold text-lg mb-3 ${
                      r.status === "error" ? "text-red-400" : "text-cyan-300"
                    }`}
                  >
                    {r.name}
                  </h3>
                  <div
                    className={`p-3 rounded-md ${
                      r.status === "error"
                        ? "bg-red-900 bg-opacity-20"
                        : "bg-cyan-900 bg-opacity-20"
                    }`}
                  >
                    <pre className="whitespace-pre-wrap break-words text-sm font-medium">
                      {r.text}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Blue Tick Popup */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-start justify-end pointer-events-none">
          <div className="relative w-40 h-40">
            {/* Outer Glow Ring */}
            <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping-slow"></div>

            {/* Pulsing Hexagon */}
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

            {/* Inner Hexagon */}
            <svg
              className="absolute inset-0 m-auto w-32 h-32 text-cyan-500"
              viewBox="0 0 100 100"
            >
              <polygon
                points="50,15 75,30 75,70 50,85 25,70 25,30"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>

            {/* Blue Tick in the Center */}
            <svg
              className="absolute inset-0 m-auto w-20 h-20 text-blue-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              viewBox="0 0 24 24"
            >
              <path
                d="M5 13l4 4L19 7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* Glowing Particles */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-cyan-400 rounded-full animate-float"
                style={{
                  top: `${50 + 30 * Math.sin((i * Math.PI) / 3)}%`,
                  left: `${50 + 30 * Math.cos((i * Math.PI) / 3)}%`,
                  animationDelay: `${i * 0.2}s`,
                }}
              ></div>
            ))}
          </div>
        </div>
      )}

      {/* Global CSS */}
      <style jsx global>{`
        .bg-grid-pattern {
          background-image: linear-gradient(
              rgba(6, 182, 212, 0.1) 1px,
              transparent 1px
            ),
            linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        @keyframes fade-in-out {
          0%,
          100% {
            opacity: 0;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }
        .animate-fade-in-out {
          animation: fade-in-out 2s ease-in-out forwards;
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
