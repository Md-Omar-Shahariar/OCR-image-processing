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

    setProcessing(false);
    setFiles([]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const imageFiles = droppedFiles.filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length > 0) {
      setFiles(imageFiles);
    }
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
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-cyan-300 p-6 font-mono">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 opacity-90 z-0"></div>
      <div className="fixed inset-0 bg-grid-pattern opacity-10 z-0"></div>

      {/* Animated Glow Effects */}
      <div className="fixed top-0 left-1/4 w-1/2 h-1 blur-md bg-cyan-500 opacity-30 animate-pulse z-0"></div>
      <div className="fixed bottom-0 left-1/3 w-1/3 h-1 blur-md bg-purple-500 opacity-30 animate-pulse z-0"></div>

      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Title with Cyberpunk Style */}
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
                <div className="mb-3">
                  <svg
                    className="w-12 h-12 mx-auto text-cyan-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    ></path>
                  </svg>
                </div>
                <p className="text-cyan-300 font-medium">
                  {files.length > 0
                    ? `${files.length} file(s) selected`
                    : "Drag & drop images here"}
                </p>
                <p className="text-cyan-600 text-sm mt-2">
                  or{" "}
                  <span className="text-cyan-400 underline">browse files</span>
                </p>
                <p className="text-cyan-700 text-xs mt-2">
                  Supports JPG, PNG, GIF, BMP
                </p>
              </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="w-full">
                <div className="text-cyan-400 mb-2 flex justify-between items-center">
                  <span>SELECTED FILES:</span>
                  <span className="text-cyan-600 text-sm">
                    {files.length} file(s)
                  </span>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-700 bg-opacity-50 rounded-md px-3 py-2"
                    >
                      <div className="flex items-center">
                        <svg
                          className="w-5 h-5 mr-2 text-cyan-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          ></path>
                        </svg>
                        <span className="text-cyan-300 text-sm truncate max-w-xs">
                          {file.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        className="text-cyan-700 hover:text-cyan-500 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
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
              {processing ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  PROCESSING...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    ></path>
                  </svg>
                  UPLOAD & EXTRACT TEXT
                </>
              )}
            </button>
          </form>
        </div>

        {/* Result Section */}
        {results.length > 0 && (
          <section className="w-full max-w-4xl bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl border border-purple-500 border-opacity-30 shadow-2xl shadow-purple-500/20 p-6">
            <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              <span className="text-cyan-300">[</span>
              OCR RESULTS
              <span className="text-cyan-300">]</span>
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
                    className={`font-semibold text-lg mb-3 flex items-center ${
                      r.status === "error" ? "text-red-400" : "text-cyan-300"
                    }`}
                  >
                    {r.status === "error" ? (
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                    )}
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

      {/* Cyberpunk Style CSS */}
      <style jsx global>{`
        @keyframes scan {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }

        .bg-grid-pattern {
          background-image: linear-gradient(
              rgba(6, 182, 212, 0.1) 1px,
              transparent 1px
            ),
            linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }

        .cyberpunk-glow {
          box-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #0ff, 0 0 20px #0ff;
        }

        .cyberpunk-border {
          border: 1px solid #0ff;
          box-shadow: inset 0 0 10px #0ff, 0 0 10px #0ff;
        }

        .scan-effect {
          position: relative;
          overflow: hidden;
        }

        .scan-effect::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(0, 255, 255, 0.2),
            transparent
          );
          animation: scan 3s linear infinite;
          pointer-events: none;
        }
      `}</style>
    </main>
  );
}
