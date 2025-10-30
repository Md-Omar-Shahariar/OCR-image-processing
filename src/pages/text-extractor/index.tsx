import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { withAuth } from "../../components/withAuth";

interface FileResult {
  name: string;
  text: string;
  status: "success" | "error";
}

function FullPageExtractor() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<FileResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulate upload progress
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    if (processing) {
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
  }, [processing]);

  const goHome = () => {
    router.push("/");
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;

    setResults([]);
    setProcessing(true);

    let hasError = false;

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", "jpn");

      try {
        console.log(`Uploading file: ${file.name}, size: ${file.size} bytes`);

        const res = await fetch("/api/process-image", {
          method: "POST",
          body: formData,
        });

        console.log(`Response status: ${res.status}`);

        if (!res.ok) {
          let errorMessage = `HTTP error! status: ${res.status}`;
          try {
            const errorData = await res.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            const errorText = await res.text();
            errorMessage = errorText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const data = await res.json();
        console.log("Upload successful:", data);

        setResults((prev) => [
          ...prev,
          {
            name: file.name,
            text: data.status === "success" ? data.text : data.message,
            status: data.status === "success" ? "success" : "error",
          },
        ]);

        if (data.status === "error") {
          hasError = true;
        }
      } catch (err) {
        console.error("Upload error:", err);
        setResults((prev) => [
          ...prev,
          {
            name: file.name,
            text: err instanceof Error ? err.message : "Error uploading file",
            status: "error",
          },
        ]);
        hasError = true;
      }
    }

    setProcessing(false);
    setFiles([]);

    if (hasError) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } else {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename.replace(/\.[^/.]+$/, "")}_extracted.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="max-w-6xl mx-auto px-4 pt-8 pb-4">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={goHome}
              className="group flex items-center space-x-3 bg-white/80 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <svg
                className="w-5 h-5 text-slate-600 group-hover:text-slate-800 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="font-semibold text-slate-700 group-hover:text-slate-900">
                Back to Home
              </span>
            </button>

            <div className="text-right bg-white/80 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/50 shadow-lg">
              <div className="text-lg font-bold text-slate-800">
                Full Page OCR
              </div>
              <div className="text-sm text-slate-600">
                Advanced Text Extraction
              </div>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 overflow-hidden mb-8">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>

              <div className="relative z-10">
                <h1 className="text-4xl font-bold text-white mb-4">
                  Extract Text from Images
                </h1>
                <p className="text-blue-100 text-lg max-w-2xl">
                  Upload any image and let our AI-powered OCR extract all
                  readable text with incredible accuracy
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
                      Upload Your Images
                    </h2>
                    <p className="text-slate-600">
                      Drag and drop images or click to browse. We&apos;ll
                      extract all readable text using advanced OCR technology.
                    </p>
                  </div>

                  {/* Drop Zone */}
                  <div
                    className={`relative border-3 border-dashed rounded-2xl p-8 text-center transition-all duration-500 cursor-pointer mb-6 group ${
                      isDragging
                        ? "border-blue-500 bg-blue-50 scale-105"
                        : "border-slate-300 hover:border-blue-400 hover:bg-blue-50"
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

                    <div className="max-w-md mx-auto">
                      <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
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
                            d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                          />
                        </svg>
                      </div>

                      <h3 className="text-xl font-semibold text-slate-800 mb-3">
                        {files.length > 0
                          ? `📁 ${files.length} file${
                              files.length > 1 ? "s" : ""
                            } selected`
                          : processing
                          ? "🔄 Processing your files..."
                          : "✨ Drop images here or click to browse"}
                      </h3>

                      <p className="text-slate-500 text-sm mb-4">
                        Supports JPG, PNG, BMP • Maximum 1MB per file
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
                          Perfect for documents, screenshots, and photos
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {processing && (
                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-slate-600 mb-2">
                        <span>Processing files...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Upload Button */}
                  <button
                    type="submit"
                    disabled={processing || files.length === 0}
                    onClick={handleUpload}
                    className={`w-full py-5 px-6 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-3 group/btn ${
                      processing || files.length === 0
                        ? "bg-slate-300 cursor-not-allowed text-slate-500"
                        : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    }`}
                  >
                    {processing ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>
                          Extracting from {files.length} image
                          {files.length > 1 ? "s" : ""}...
                        </span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-6 h-6 group-hover/btn:scale-110 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        <span>Extract Text from Images</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Right Column - File List & Info */}
                <div>
                  {/* File List */}
                  {files.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                        <span>📄 Selected Files</span>
                        <span className="bg-blue-100 text-blue-600 text-sm px-3 py-1 rounded-full">
                          {files.length}
                        </span>
                      </h3>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-300 transition-all duration-300 hover:shadow-md group/item"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg
                                  className="w-5 h-5 text-blue-600"
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
                              <div>
                                <div className="text-slate-800 font-medium text-sm truncate max-w-xs">
                                  {file.name}
                                </div>
                                <div className="text-slate-500 text-xs">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFile(index);
                              }}
                              className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
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
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tips Card */}
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-200">
                    <h4 className="font-semibold text-cyan-800 mb-3 flex items-center space-x-2">
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
                    <ul className="space-y-2 text-sm text-cyan-700">
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
                        <span>Use high-quality, clear images</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
                        <span>Ensure text is readable and not blurry</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
                        <span>Good lighting reduces errors</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
                        <span>Multiple images processed simultaneously</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          {results.length > 0 && (
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                    <span>🎉 Extraction Complete!</span>
                  </h2>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <span className="text-white font-semibold">
                      {results.filter((r) => r.status === "success").length} of{" "}
                      {results.length} files processed
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  {results.map((result, idx) => (
                    <div
                      key={idx}
                      className={`rounded-2xl p-1 bg-gradient-to-r ${
                        result.status === "error"
                          ? "from-red-500 to-pink-500"
                          : "from-green-500 to-emerald-500"
                      }`}
                    >
                      <div className="bg-white rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-4">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                result.status === "error"
                                  ? "bg-red-100 text-red-600"
                                  : "bg-green-100 text-green-600"
                              }`}
                            >
                              {result.status === "error" ? "❌" : "✅"}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-800 text-lg">
                                {result.name}
                              </h3>
                              <p
                                className={`text-sm font-medium ${
                                  result.status === "error"
                                    ? "text-red-600"
                                    : "text-green-600"
                                }`}
                              >
                                {result.status === "error"
                                  ? "Processing failed"
                                  : "Text extracted successfully"}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => copyToClipboard(result.text)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 group/copy"
                            >
                              <svg
                                className="w-4 h-4 group-hover/copy:scale-110 transition-transform"
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
                              onClick={() =>
                                downloadText(result.text, result.name)
                              }
                              className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 group/download"
                            >
                              <svg
                                className="w-4 h-4 group-hover/download:scale-110 transition-transform"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              <span>Download</span>
                            </button>
                          </div>
                        </div>

                        {/* Extracted Text */}
                        {result.status === "success" ? (
                          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-semibold text-slate-700 text-lg">
                                📝 Extracted Text
                              </h4>
                              <div className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full">
                                {result.text.length} characters
                              </div>
                            </div>
                            <div className="bg-white rounded-lg border border-slate-200 p-4 max-h-60 overflow-y-auto">
                              <pre className="text-slate-700 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                                {result.text ||
                                  "No text could be extracted from this image."}
                              </pre>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                            <div className="flex items-center space-x-3 text-red-800">
                              <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <div>
                                <div className="font-semibold">
                                  Processing Error
                                </div>
                                <p className="text-red-700 mt-1">
                                  {result.text}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!processing && results.length === 0 && files.length === 0 && (
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-3xl flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-blue-600"
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
                Ready to Extract Text
              </h3>
              <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto">
                Upload images to extract all readable text using our advanced
                OCR technology. Perfect for documents, screenshots, and photos.
              </p>
              <div className="inline-flex items-center space-x-2 bg-slate-100 rounded-full px-4 py-2">
                <span className="text-slate-600">
                  ✨ Supports multiple file formats and batch processing
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center py-8">
          <div className="inline-flex flex-wrap justify-center gap-6 bg-white/80 backdrop-blur-md rounded-2xl px-8 py-6 border border-white/50 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <div className="text-sm font-semibold text-slate-800">
                  OCR Engine
                </div>
                <div className="text-xs text-slate-500">Active</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <div>
                <div className="text-sm font-semibold text-slate-800">
                  AI Processing
                </div>
                <div className="text-xs text-slate-500">Ready</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse"></div>
              <div>
                <div className="text-sm font-semibold text-slate-800">
                  Text Extraction
                </div>
                <div className="text-xs text-slate-500">Online</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-4 backdrop-blur-md">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <div className="font-bold">🎉 Extraction Complete!</div>
              <div className="text-green-100 text-sm">
                All text has been extracted successfully
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {showError && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-4 backdrop-blur-md">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
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
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <div className="font-bold">⚠️ Processing Issues</div>
              <div className="text-red-100 text-sm">
                Some files couldn&apos;t be processed
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        @keyframes slide-up {
          0% {
            transform: translateY(100%);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </main>
  );
}

export default withAuth(FullPageExtractor);
