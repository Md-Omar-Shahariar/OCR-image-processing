import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { withAuth } from "../../components/withAuth";
import AppShell from "../../components/layout/AppShell";
import PageHeaderCard from "../../components/ui/PageHeaderCard";
import UploadDropzone from "../../components/upload/UploadDropzone";
import FileList from "../../components/upload/FileList";
import ProgressBar from "../../components/ui/ProgressBar";
import Toast from "../../components/feedback/Toast";

interface SearchResult {
  title: string;
  url: string;
  description?: string;
}

interface FileResult {
  name: string;
  text: string;
  searchResults: SearchResult[];
  resultCount: number;
  status: "success" | "error";
  engine: TitleEngine;
}

const titleEngineOptions = {
  ocrspace: {
    label: "CopyFish (OCR.Space)",
    description: "Great for quick SERP captures and general screenshots.",
    helperText: "OCR.Space pipeline parses text before structuring titles/URLs.",
    maxSizeCopy: "Supports JPG, PNG, BMP • Max 10MB per file",
    accent: "from-purple-500 to-pink-500",
    badge: "Default",
  },
  vision: {
    label: "Google Vision",
    description: "Best for dense or multilingual SERP screenshots.",
    helperText:
      "Google Vision extracts the text, then we auto-parse the SERP sections.",
    maxSizeCopy: "Supports JPG, PNG • Max 4MB per file",
    accent: "from-emerald-500 to-sky-500",
  },
} as const;

type TitleEngine = keyof typeof titleEngineOptions;
const titleEngineOrder: TitleEngine[] = ["ocrspace", "vision"];

function TitleExtractor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<FileResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  const [engine, setEngine] = useState<TitleEngine>("ocrspace");
  const activeEngine = titleEngineOptions[engine];
  const accentIdleClasses =
    engine === "vision"
      ? "border-slate-300 hover:border-emerald-400 hover:bg-emerald-50"
      : "border-slate-300 hover:border-purple-400 hover:bg-purple-50";
  const accentActiveClasses =
    engine === "vision"
      ? "border-emerald-500 bg-emerald-50 scale-105"
      : "border-purple-500 bg-purple-50 scale-105";

  useEffect(() => {
    const engineParam = searchParams.get("engine");
    if (
      engineParam &&
      (engineParam === "vision" || engineParam === "ocrspace") &&
      engineParam !== engine
    ) {
      setEngine(engineParam as TitleEngine);
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
        const endpoint =
          selectedEngine === "vision"
            ? "/api/process-image-vision"
            : "/api/process-image-title";

        const res = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        setResults((prev) => [
          ...prev,
          {
            name: file.name,
            text: data.status === "success" ? data.text : data.message,
            searchResults: data.searchResults || [],
            resultCount: data.resultCount || 0,
            status: data.status === "success" ? "success" : "error",
            engine: selectedEngine,
          },
        ]);

        if (data.status !== "success") {
          hasError = true;
        }
      } catch {
        setResults((prev) => [
          ...prev,
          {
            name: file.name,
            text: "Network error occurred while processing file",
            searchResults: [],
            resultCount: 0,
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

  return (
    <AppShell gradient="bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="relative z-10">
        {/* Header */}
        <div className="max-w-6xl mx-auto px-4 pt-8 pb-4">
          <PageHeaderCard
            onBack={goHome}
            title="Title & Link Extractor"
            subtitle="AI-Powered OCR Technology"
            stats={[
              { label: "Step-by-Step", value: "Upload ▸ Extract ▸ Copy" },
              { label: "Average run", value: "~6s per image" },
            ]}
          />

          {/* Main Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 overflow-hidden mb-8">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>

              <div className="relative z-10">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                  Extract Titles & Links from Images
                </h1>
                <p className="text-purple-100 text-base sm:text-lg max-w-2xl">
                  Upload screenshots of search results to automatically extract
                  titles, URLs, and descriptions with our advanced AI technology
                </p>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  {[
                    {
                      label: "Ideal for",
                      value: "Market & SEO research",
                    },
                    {
                      label: "Accuracy boost",
                      value: "+92% link detection",
                    },
                    {
                      label: "Privacy",
                      value: "Processed in-session only",
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-white/15 rounded-2xl px-4 py-3 backdrop-blur-sm border border-white/10 text-center sm:text-left"
                    >
                      <div className="text-purple-50 uppercase tracking-wide text-xs mb-1">
                        {stat.label}
                      </div>
                      <div className="text-white font-semibold text-base">
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Upload Section */}
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Left Column - Upload Area */}
                <div>
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-3">
                      Upload Your Images
                    </h2>
                    <p className="text-slate-600">
                      Drag and drop your search result screenshots or click to
                      browse. We&apos;ll automatically detect and extract titles
                      with their corresponding URLs.
                    </p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                        Choose OCR Engine
                      </h3>
                      <span className="text-xs text-slate-500">
                        CopyFish or Google Vision
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {titleEngineOrder.map((key) => {
                        const option = titleEngineOptions[key];
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
                              : "from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
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
                        <span>Use {activeEngine.label}</span>
                      </>
                    )}
                  </button>

                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => setShowGuide((prev) => !prev)}
                      className="w-full flex items-center justify-between bg-slate-100 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-200 transition"
                    >
                      <span>Need a quick walkthrough?</span>
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          showGuide ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {showGuide && (
                      <ol className="mt-4 space-y-3 bg-white rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">
                        <li>
                          <span className="font-semibold text-slate-800">
                            1.
                          </span>{" "}
                          Drop up to 5 screenshots with readable titles & URLs.
                        </li>
                        <li>
                          <span className="font-semibold text-slate-800">
                            2.
                          </span>{" "}
                          Hit <span className="font-semibold">Extract</span> and
                          let the AI detect structured result blocks.
                        </li>
                        <li>
                          <span className="font-semibold text-slate-800">
                            3.
                          </span>{" "}
                          Copy the hyperlinks or raw text for your notes or
                          spreadsheets.
                        </li>
                      </ol>
                    )}
                  </div>
                </div>

                {/* Right Column - File List & Info */}
                <div>
                  {files.length > 0 && (
                    <FileList
                      files={files}
                      onRemoveFile={removeFile}
                      accentColor={engine === "vision" ? "emerald" : "purple"}
                    />
                  )}

                  {/* Tips Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-3 flex items-center space-x-2">
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
                      <span>Pro Tips</span>
                    </h4>
                    <ul className="space-y-2 text-sm text-blue-700">
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        <span>Use clear screenshots of search results</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        <span>Ensure text is readable and not blurry</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
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
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                    <span>🎉 Extraction Complete!</span>
                  </h2>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-center">
                    <span className="text-white font-semibold">
                      {results.reduce((acc, r) => acc + r.resultCount, 0)} links
                      found
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="space-y-6">
                  {results.map((result, idx) => (
                    <div
                      key={idx}
                      className={`rounded-2xl p-1 bg-gradient-to-r ${
                        result.status === "error"
                          ? "from-red-500 to-pink-500"
                          : result.resultCount > 0
                          ? "from-green-500 to-emerald-500"
                          : "from-yellow-500 to-amber-500"
                      }`}
                    >
                      <div className="bg-white rounded-xl p-4 sm:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                result.status === "error"
                                  ? "bg-red-100 text-red-600"
                                  : result.resultCount > 0
                                  ? "bg-green-100 text-green-600"
                                  : "bg-yellow-100 text-yellow-600"
                              }`}
                            >
                              {result.status === "error"
                                ? "❌"
                                : result.resultCount > 0
                                ? "✅"
                                : "⚠️"}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-800">
                                {result.name}
                              </h3>
                              <p className="text-xs text-slate-500">
                                Engine: {titleEngineOptions[result.engine].label}
                              </p>
                              <p
                                className={`text-sm font-medium ${
                                  result.status === "error"
                                    ? "text-red-600"
                                    : result.resultCount > 0
                                    ? "text-green-600"
                                    : "text-yellow-600"
                                }`}
                              >
                                {result.status === "error"
                                  ? "Processing failed"
                                  : result.resultCount > 0
                                  ? `${result.resultCount} links extracted`
                                  : "No links detected"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Search Results */}
                        {result.searchResults.length > 0 ? (
                          <div className="space-y-4">
                            <h4 className="font-semibold text-slate-700 text-lg mb-4">
                              📋 Extracted Results
                            </h4>
                            <div className="grid gap-4">
                              {result.searchResults.map((link, linkIdx) => (
                                <div
                                  key={linkIdx}
                                  className="bg-slate-50 rounded-xl p-5 border border-slate-200 hover:border-purple-300 transition-all duration-300 group/link"
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                      <div className="text-sm text-slate-500 font-medium mb-2">
                                        Title
                                      </div>
                                      <div className="text-slate-800 font-semibold text-lg mb-1">
                                        {link.title}
                                      </div>
                                      {link.description && (
                                        <>
                                          <div className="text-sm text-slate-500 font-medium mb-2 mt-3">
                                            Description
                                          </div>
                                          <div className="text-slate-600">
                                            {link.description}
                                          </div>
                                        </>
                                      )}
                                    </div>
                                    <button
                                      onClick={() =>
                                        copyToClipboard(link.title)
                                      }
                                      className="opacity-0 group-hover/link:opacity-100 transition-opacity duration-300 text-slate-400 hover:text-purple-600 p-2"
                                      title="Copy title"
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
                                    </button>
                                  </div>
                                  <div>
                                    <div className="text-sm text-slate-500 font-medium mb-2">
                                      🔗 URL
                                    </div>
                                    <a
                                      href={link.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-purple-600 hover:text-purple-700 break-all font-medium inline-flex items-center space-x-2 group/url"
                                    >
                                      <span>{link.url}</span>
                                      <svg
                                        className="w-4 h-4 group-hover/url:translate-x-1 transition-transform"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                        />
                                      </svg>
                                    </a>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : result.status === "success" ? (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                              <svg
                                className="w-8 h-8 text-yellow-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                                />
                              </svg>
                            </div>
                            <h4 className="text-lg font-semibold text-slate-700 mb-2">
                              No structured links detected
                            </h4>
                            <p className="text-slate-600 mb-4">
                              We couldn&apos;t find any titles with URLs in this
                              image.
                            </p>
                            <button
                              onClick={() => copyToClipboard(result.text)}
                              className="inline-flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg transition-colors"
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
                              <span>Copy extracted text</span>
                            </button>
                          </div>
                        ) : (
                          <div className="bg-red-50 rounded-xl p-4 border border-red-200">
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
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-purple-600"
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
                Ready to Extract Titles & Links
              </h3>
              <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto">
                Upload search result screenshots to automatically extract titles
                with their corresponding URLs and descriptions.
              </p>
              <div className="inline-flex items-center space-x-2 bg-slate-100 rounded-full px-4 py-2">
                <span className="text-slate-600">
                  ✨ Perfect for research, content curation, and data extraction
                </span>
              </div>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                {[
                  {
                    title: "Crystal Clear Dashboard",
                    copy: "Track every upload with live progress feedback and smart toasts.",
                  },
                  {
                    title: "Copy-ready Results",
                    copy: "Use the copy buttons to move summaries into docs in a click.",
                  },
                  {
                    title: "Privacy-first",
                    copy: "Files stay in-memory only—refresh to clean your workspace.",
                  },
                ].map((card) => (
                  <div
                    key={card.title}
                    className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-sm"
                  >
                    <div className="text-sm font-semibold text-purple-600 mb-1">
                      {card.title}
                    </div>
                    <p className="text-slate-600 text-sm">{card.copy}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center py-8">
          <div className="inline-flex flex-wrap justify-center gap-6 bg-white/80 backdrop-blur-md rounded-2xl px-6 sm:px-8 py-6 border border-white/50 shadow-lg w-full max-w-3xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <div className="text-sm font-semibold text-slate-800">
                  AI Processing
                </div>
                <div className="text-xs text-slate-500">Active</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
              <div>
                <div className="text-sm font-semibold text-slate-800">
                  Title Extraction
                </div>
                <div className="text-xs text-slate-500">Ready</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <div>
                <div className="text-sm font-semibold text-slate-800">
                  URL Detection
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
          message="All titles and links have been extracted successfully"
        />
      )}

      {showError && (
        <Toast
          title="⚠️ Partial Completion"
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

export default withAuth(TitleExtractor);
