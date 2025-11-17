import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { withAuth } from "../../components/withAuth";
import AppShell from "../../components/layout/AppShell";
import PageHeaderCard from "../../components/ui/PageHeaderCard";
import UploadDropzone from "../../components/upload/UploadDropzone";
import FileList from "../../components/upload/FileList";
import ProgressBar from "../../components/ui/ProgressBar";
import Toast from "../../components/feedback/Toast";

interface FileResult {
  name: string;
  text: string;
  status: "success" | "error";
}

function VisionFullPageExtractor() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<FileResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  const goHome = () => router.push("/");

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
        const res = await fetch("/api/process-fullpage-vision", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          throw new Error(errorData?.message || "Vision API processing failed");
        }

        const data = await res.json();

        setResults((prev) => [
          ...prev,
          {
            name: file.name,
            text: data.status === "success" ? data.text : data.message,
            status: data.status === "success" ? "success" : "error",
          },
        ]);

        if (data.status !== "success") {
          hasError = true;
        }
      } catch (error) {
        console.error("Vision upload error:", error);
        setResults((prev) => [
          ...prev,
          {
            name: file.name,
            text:
              error instanceof Error
                ? error.message
                : "Error uploading file",
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

  const handleFilesChange = (selectedFiles: File[]) => setFiles(selectedFiles);

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const resetWorkspace = () => {
    setFiles([]);
    setResults([]);
  };

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

  const downloadText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename.replace(/\.[^/.]+$/, "")}_vision-fullpage.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell gradient="bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <div className="relative z-10">
        <div className="max-w-6xl mx-auto px-4 pt-8 pb-4">
          <PageHeaderCard
            onBack={goHome}
            title="Google Vision Full Page OCR"
            subtitle="Document-grade OCR using Google Cloud Vision"
            stats={[
              { label: "Engine", value: "Vision API (DOCUMENT_TEXT_DETECTION)" },
              { label: "Best for", value: "Docs, PDFs, dense layouts" },
            ]}
          />

          <div className="bg-white/85 backdrop-blur-md rounded-3xl shadow-2xl border border-white/60 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-emerald-500 via-sky-500 to-blue-600 p-8 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_#ffffff40,_transparent_55%)]"></div>
              <div className="relative z-10">
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Pull perfect text from any screenshot or scan
                </h1>
                <p className="text-blue-50 text-base sm:text-lg max-w-2xl">
                  Send your image through Google Cloud Vision&apos;s full-page
                  OCR engine for exceptional accuracy on tight columns, tables,
                  and multilingual content.
                </p>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  {[
                    { label: "Accuracy boost", value: "+15% vs standard OCR" },
                    { label: "Languages", value: "Japanese, English, CN, KR" },
                    { label: "File limit", value: "4MB / image" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-white/15 rounded-2xl px-4 py-3 backdrop-blur-sm border border-white/10 text-center sm:text-left"
                    >
                      <div className="text-white/80 uppercase tracking-wide text-xs mb-1">
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

            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div>
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-3">
                      Drop images for OCR
                    </h2>
                    <p className="text-slate-600">
                      Works best with scan-quality screenshots, PDF exports, or
                      mobile captures with clear contrast.
                    </p>
                  </div>

                  <UploadDropzone
                    files={files}
                    processing={processing}
                    helperText="Vision OCR handles columns, tables, and dense characters."
                    maxSizeCopy="Supports JPG / PNG • Max 4MB per file"
                    accentGradient="from-emerald-500 to-sky-500"
                    idleClasses="border-slate-300 hover:border-emerald-400 hover:bg-emerald-50"
                    activeClasses="border-emerald-500 bg-emerald-50 scale-105"
                    browseLabel="Add files"
                    onFilesChange={handleFilesChange}
                    onClearWorkspace={resetWorkspace}
                    isClearDisabled={files.length === 0 && results.length === 0}
                  />

                  {processing && (
                    <ProgressBar
                      value={uploadProgress}
                      accentClass="from-emerald-500 to-sky-500"
                    />
                  )}

                  <button
                    type="submit"
                    disabled={processing || files.length === 0}
                    onClick={handleUpload}
                    className={`w-full py-5 px-6 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-3 group/btn ${
                      processing || files.length === 0
                        ? "bg-slate-300 cursor-not-allowed text-slate-500"
                        : "bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-600/90 hover:to-blue-600/90 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    }`}
                  >
                    {processing ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>
                          Sending {files.length} file
                          {files.length > 1 ? "s" : ""} to Google Vision...
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
                        <span>Extract with Google Vision</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-6">
                  {files.length > 0 && (
                    <FileList
                      files={files}
                      onRemoveFile={removeFile}
                      accentColor="emerald"
                    />
                  )}

                  <div className="bg-gradient-to-br from-slate-50 to-emerald-50 rounded-2xl p-6 border border-emerald-100">
                    <h4 className="font-semibold text-emerald-800 mb-3 flex items-center space-x-2">
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
                      <span>Vision OCR tips</span>
                    </h4>
                    <ul className="space-y-2 text-sm text-emerald-700">
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        <span>Use scans with at least 300dpi for best results</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        <span>Crop out UI chrome or irrelevant margins</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        <span>Supports vertical text (Japanese) automatically</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        <span>Max dimension ~20MP. Compress very large scans.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {results.length > 0 && (
            <div className="space-y-6">
              {results.map((result, index) => (
                <div
                  key={`${result.name}-${index}`}
                  className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/60 p-6 sm:p-8"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4 sm:mb-6">
                    <div>
                      <div className="text-sm uppercase text-slate-500 font-semibold">
                        Source
                      </div>
                      <div className="text-xl font-bold text-slate-800">
                        {result.name}
                      </div>
                    </div>
                    <div className="flex-1 flex flex-wrap gap-3">
                      <button
                        onClick={() => copyToClipboard(result.text)}
                        className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 group/copy"
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
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-2 4h2a2 2 0 012 2v8a2 2 0 01-2 2h-8a2 2 0 01-2-2v-2"
                          />
                        </svg>
                        <span>Copy</span>
                      </button>
                      <button
                        onClick={() => downloadText(result.text, result.name)}
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

                  {result.status === "success" ? (
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-slate-700 text-lg">
                          📝 Extracted with Google Vision
                        </h4>
                        <div className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full">
                          {result.text.length} characters
                        </div>
                      </div>
                      <div className="bg-white rounded-xl border border-slate-200 p-4 max-h-64 overflow-y-auto">
                        <pre className="text-slate-700 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                          {result.text ||
                            "No text could be extracted from this image."}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-50 rounded-2xl p-5 border border-red-200">
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
                          <div className="font-semibold">Processing error</div>
                          <p className="text-red-700 mt-1">{result.text}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {!processing && results.length === 0 && files.length === 0 && (
            <div className="bg-white/85 backdrop-blur-md rounded-3xl shadow-2xl border border-white/60 p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-3xl flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-emerald-600"
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
                Ready for Vision OCR
              </h3>
              <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto">
                Upload any full page screenshot or document image and get clean
                text parsed by Google Cloud Vision.
              </p>
              <div className="inline-flex items-center space-x-2 bg-slate-100 rounded-full px-4 py-2 text-slate-600">
                ✨ Perfect for full-page SERPs, ebooks, documents, and catalogs
              </div>
            </div>
          )}
        </div>

        <div className="text-center py-8">
          <div className="inline-flex flex-wrap justify-center gap-6 bg-white/85 backdrop-blur-md rounded-2xl px-8 py-6 border border-white/50 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <div className="text-sm font-semibold text-slate-800">
                  Vision API
                </div>
                <div className="text-xs text-slate-500">Online</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <div>
                <div className="text-sm font-semibold text-slate-800">
                  OCR Pipeline
                </div>
                <div className="text-xs text-slate-500">Active</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              <div>
                <div className="text-sm font-semibold text-slate-800">
                  Text export
                </div>
                <div className="text-xs text-slate-500">Ready</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSuccess && (
        <Toast
          title="🚀 Vision OCR complete"
          message="Google Vision returned clean text for your files"
        />
      )}

      {showError && (
        <Toast
          title="⚠️ Vision issues"
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

export default withAuth(VisionFullPageExtractor);
