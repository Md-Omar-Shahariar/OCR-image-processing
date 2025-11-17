import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { withAuth } from "../../components/withAuth";
import AppShell from "../../components/layout/AppShell";
import PageHeaderCard from "../../components/ui/PageHeaderCard";
import UploadDropzone from "../../components/upload/UploadDropzone";
import FileList from "../../components/upload/FileList";
import ProgressBar from "../../components/ui/ProgressBar";
import Toast from "../../components/feedback/Toast";

const fullPageEngineOptions = {
  ocrspace: {
    label: "CopyFish (OCR.Space)",
    description: "Fast, reliable OCR powered by OCR.Space / CopyFish.",
    helperText: "Ideal for quick batches of documents, forms, or screenshots.",
    maxSizeCopy: "Supports JPG, PNG, BMP • Max 10MB per file",
    accent: "from-blue-500 to-cyan-500",
    badge: "Default",
  },
  vision: {
    label: "Google Vision",
    description:
      "Higher accuracy for dense layouts, columns, and multilingual text.",
    helperText: "Harness Google Cloud Vision for premium OCR quality.",
    maxSizeCopy: "Supports JPG, PNG • Max 4MB per file",
    accent: "from-emerald-500 to-sky-500",
  },
} as const;

type FullPageEngine = keyof typeof fullPageEngineOptions;
const fullPageEngineOrder: FullPageEngine[] = ["ocrspace", "vision"];

interface FileResult {
  name: string;
  text: string;
  status: "success" | "error";
  engine: FullPageEngine;
}

function FullPageExtractor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<FileResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [engine, setEngine] = useState<FullPageEngine>("ocrspace");
  const activeEngine = fullPageEngineOptions[engine];
  const accentIdleClasses =
    engine === "vision"
      ? "border-slate-300 hover:border-emerald-400 hover:bg-emerald-50"
      : "border-slate-300 hover:border-blue-400 hover:bg-blue-50";
  const accentActiveClasses =
    engine === "vision"
      ? "border-emerald-500 bg-emerald-50 scale-105"
      : "border-blue-500 bg-blue-50 scale-105";

  useEffect(() => {
    const engineParam = searchParams.get("engine");
    if (
      engineParam &&
      (engineParam === "vision" || engineParam === "ocrspace") &&
      engineParam !== engine
    ) {
      setEngine(engineParam as FullPageEngine);
    }
  }, [searchParams, engine]);

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
    const selectedEngine = engine;

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", "jpn");

      try {
        console.log(`Uploading file: ${file.name}, size: ${file.size} bytes`);

        const endpoint =
          selectedEngine === "vision"
            ? "/api/process-fullpage-vision"
            : "/api/process-image";

        const res = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });

        console.log(`Response status: ${res.status}`);

        if (!res.ok) {
          let errorMessage = `HTTP error! status: ${res.status}`;
          try {
            const errorData = await res.json();
            errorMessage = errorData.message || errorMessage;
          } catch {
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
            engine: selectedEngine,
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
            engine: selectedEngine,
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

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const resetWorkspace = () => {
    setFiles([]);
    setResults([]);
  };

  const handleFilesChange = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
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
    <AppShell gradient="bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="relative z-10">
        {/* Header */}
        <div className="max-w-6xl mx-auto px-4 pt-8 pb-4">
          <PageHeaderCard
            onBack={goHome}
            title="Full Page OCR"
            subtitle="Advanced Text Extraction"
            stats={[
              { label: "Best for", value: "Docs & screenshots" },
              { label: "Avg. speed", value: "~4s per image" },
            ]}
          />

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

                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                        Choose OCR Engine
                      </h3>
                      <span className="text-xs text-slate-500">
                        Switch anytime
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {fullPageEngineOrder.map((key) => {
                        const option = fullPageEngineOptions[key];
                        const isActive = engine === key;
                        return (
                          <button
                            type="button"
                            key={key}
                            disabled={processing}
                            onClick={() => setEngine(key)}
                            className={`text-left rounded-2xl border px-4 py-4 transition-all ${
                              isActive
                                ? `bg-gradient-to-r ${option.accent} text-white shadow-lg`
                                : "bg-white text-slate-700 hover:border-slate-300"
                            }`}
                            aria-pressed={isActive}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span
                                className={`font-semibold ${
                                  isActive ? "text-white" : "text-slate-800"
                                }`}
                              >
                                {option.label}
                              </span>
                              {option.badge && (
                                <span
                                  className={`text-[11px] font-semibold tracking-wide px-2 py-0.5 rounded-full ${
                                    isActive
                                      ? "bg-white/25 text-white"
                                      : "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  {option.badge}
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-sm ${
                                isActive ? "text-white/80" : "text-slate-500"
                              }`}
                            >
                              {option.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <UploadDropzone
                    files={files}
                    processing={processing}
                    helperText={activeEngine.helperText}
                    maxSizeCopy={activeEngine.maxSizeCopy}
                    accentGradient={activeEngine.accent}
                    idleClasses={accentIdleClasses}
                    activeClasses={accentActiveClasses}
                    browseLabel="Browse files"
                    onFilesChange={handleFilesChange}
                    onClearWorkspace={resetWorkspace}
                    isClearDisabled={files.length === 0 && results.length === 0}
                  />

                  {processing && (
                    <ProgressBar
                      value={uploadProgress}
                      accentClass={activeEngine.accent}
                    />
                  )}

                  {/* Upload Button */}
                  <button
                    type="submit"
                    disabled={processing || files.length === 0}
                    onClick={handleUpload}
                    className={`w-full py-5 px-6 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-3 group/btn ${
                      processing || files.length === 0
                        ? "bg-slate-300 cursor-not-allowed text-slate-500"
                        : `bg-gradient-to-r ${
                            engine === "vision"
                              ? "from-emerald-600 to-sky-600 hover:from-emerald-600/90 hover:to-sky-600/90"
                              : "from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                          } text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1`
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
                        <span>
                          Use {activeEngine.label}
                        </span>
                      </>
                    )}
                  </button>
                </div>

                {/* Right Column - File List & Info */}
                <div>
                  {files.length > 0 && (
                    <FileList
                      files={files}
                      onRemoveFile={removeFile}
                      accentColor={engine === "vision" ? "emerald" : "blue"}
                    />
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
                              <p className="text-xs text-slate-500">
                                Engine: {fullPageEngineOptions[result.engine].label}
                              </p>
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

      {showSuccess && (
        <Toast
          title="🎉 Extraction Complete!"
          message="All text has been extracted successfully"
        />
      )}

      {showError && (
        <Toast
          title="⚠️ Processing Issues"
          message="Some files couldn&apos;t be processed"
          gradientClass="from-red-500 to-pink-500"
          icon={
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
          }
        />
      )}
    </AppShell>
  );
}

export default withAuth(FullPageExtractor);
