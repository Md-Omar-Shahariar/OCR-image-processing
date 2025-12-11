import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { withAuth } from "../../components/withAuth";
import AppShell from "../../components/layout/AppShell";
import PageHeaderCard from "../../components/ui/PageHeaderCard";
import UploadDropzone from "../../components/upload/UploadDropzone";
import FileList from "../../components/upload/FileList";
import ProgressBar from "../../components/ui/ProgressBar";
import Toast from "../../components/feedback/Toast";
import { FrameOcrResult } from "@/types/type";

const SUPPORTED_LANGUAGES = [
  { code: "eng", label: "English" },
  { code: "jpn", label: "Japanese" },
  { code: "chi", label: "Chinese" },
  { code: "kor", label: "Korean" },
];

function VisionVideoExtractor() {
  const router = useRouter();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("eng");
  const [frames, setFrames] = useState<FrameOcrResult[]>([]);
  const [aggregateText, setAggregateText] = useState("");
  const [processing, setProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
      const timeout = setTimeout(() => setUploadProgress(0), 800);
      return () => clearTimeout(timeout);
    }
    return () => clearInterval(progressInterval);
  }, [processing]);

  const resetWorkspace = () => {
    setVideoFile(null);
    setFrames([]);
    setAggregateText("");
  };

  const onFilesChange = (files: File[]) => {
    setVideoFile(files[0] ?? null);
    setFrames([]);
    setAggregateText("");
    setErrorMessage("");
  };

  const removeFile = () => {
    resetWorkspace();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

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

  const sanitizeFilename = (name: string) => {
    const base = name.replace(/\.[^/.]+$/, "");
    const cleaned = base.replace(/[^\w\-]+/g, "_");
    return cleaned || "video_text";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!videoFile) return;

    setProcessing(true);
    setFrames([]);
    setAggregateText("");
    setShowSuccess(false);
    setShowError(false);
    setErrorMessage("");

    const formData = new FormData();
    formData.append("file", videoFile);
    formData.append("language", language);

    try {
      const response = await fetch("/api/process-video-vision", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (response.ok && data.status === "success") {
        setFrames(data.frames || []);
        setAggregateText(data.aggregateText || "");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2500);
      } else {
        setErrorMessage(
          data.message || "Video could not be processed. Please try again."
        );
        setShowError(true);
        setTimeout(() => setShowError(false), 2500);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Network error while processing the video.");
      setShowError(true);
      setTimeout(() => setShowError(false), 2500);
    } finally {
      setProcessing(false);
    }
  };

  const hasResults = frames.length > 0 || aggregateText.length > 0;

  const goHome = () => router.push("/");

  return (
    <AppShell gradient="bg-gradient-to-br from-slate-50 via-sky-50 to-emerald-50">
      <div className="relative z-10">
        <div className="max-w-6xl mx-auto px-4 pt-8 pb-6">
          <PageHeaderCard
            onBack={goHome}
            title="Video Frame Text Extractor"
            subtitle="Upload a short video with on-screen text. We sample frames, run Google Vision OCR, and return the combined transcript."
            stats={[
              { label: "Engine", value: "Google Vision" },
              { label: "Frames", value: "Up to 12 / video" },
            ]}
          />

          <div className="bg-white/85 backdrop-blur-md rounded-3xl shadow-2xl border border-white/60 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
              <div className="relative z-10">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                  Extract Text from Silent Videos
                </h1>
                <p className="text-blue-50 text-base sm:text-lg max-w-3xl">
                  Perfect for tutorials, screen recordings, and reels without voiceovers. We capture key frames and merge all on-screen text for you.
                </p>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  {[
                    { label: "Ideal length", value: "< 1 min, < 50MB" },
                    { label: "Sampling", value: "1 fps · max 12 frames" },
                    { label: "Output", value: "Per-frame + merged text" },
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
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-slate-800 mb-2">
                        Upload your video
                      </h2>
                      <p className="text-slate-600">
                        We strip audio, sample clear frames, and run Vision OCR on each frame. Best for videos with prominent text overlays.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      <label className="flex flex-col space-y-2 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                        <span className="text-sm font-semibold text-slate-700">
                          Language hint
                        </span>
                        <select
                          value={language}
                          onChange={(event) => setLanguage(event.target.value)}
                          className="border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                        >
                          {SUPPORTED_LANGUAGES.map((lang) => (
                            <option key={lang.code} value={lang.code}>
                              {lang.label}
                            </option>
                          ))}
                        </select>
                        <span className="text-xs text-slate-500">
                          Helps Vision prioritize the right character set.
                        </span>
                      </label>
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                        <div className="text-sm font-semibold text-slate-700 mb-1">
                          Sampling rules
                        </div>
                        <ul className="text-sm text-slate-600 space-y-1">
                          <li>• 1 frame per second</li>
                          <li>• Up to 12 frames per upload</li>
                          <li>• Frames resized to 1280px wide</li>
                        </ul>
                      </div>
                    </div>

                    <UploadDropzone
                      files={videoFile ? [videoFile] : []}
                      processing={processing}
                      helperText="Optimized for MP4/MOV • Under 50MB"
                      maxSizeCopy="We only read video frames—no audio"
                      onFilesChange={onFilesChange}
                      onClearWorkspace={resetWorkspace}
                      isClearDisabled={!videoFile && !hasResults}
                      accept="video/*"
                      browseLabel="Choose video"
                      clearLabel="Reset"
                      accentGradient="from-emerald-500 to-sky-500"
                      idleClasses="border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50"
                      activeClasses="border-emerald-500 bg-emerald-50 scale-105"
                    />

                    {processing && (
                      <ProgressBar
                        value={uploadProgress}
                        accentClass="from-emerald-500 to-sky-500"
                      />
                    )}

                    <button
                      type="submit"
                      disabled={processing || !videoFile}
                      className={`w-full py-5 px-6 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-3 group/btn ${
                        processing || !videoFile
                          ? "bg-slate-300 cursor-not-allowed text-slate-500"
                          : "bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      }`}
                    >
                      {processing ? (
                        <>
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Extracting text...</span>
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
                          <span>Process video</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                <div>
                  {videoFile && (
                    <FileList
                      files={[videoFile]}
                      onRemoveFile={removeFile}
                      accentColor="emerald"
                    />
                  )}

                  <div className="bg-gradient-to-br from-emerald-50 to-sky-50 rounded-2xl p-6 border border-emerald-200">
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
                      <span>Best results</span>
                    </h4>
                    <ul className="space-y-2 text-sm text-emerald-800">
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        <span>Use crisp screen recordings with readable text.</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        <span>Keep clips short; we only sample the first 12 frames.</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        <span>High-contrast text overlays work best.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {hasResults && (
            <div className="bg-white/85 backdrop-blur-md rounded-3xl shadow-2xl border border-white/60 overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-emerald-600 to-blue-600 p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                    <span>🎉 Video processed</span>
                  </h2>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-center">
                    <span className="text-white font-semibold">
                      {frames.length} frame{frames.length === 1 ? "" : "s"} analyzed
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-6">
                {aggregateText && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">
                          Combined transcript
                        </h3>
                        <p className="text-sm text-slate-600">
                          Unique lines merged across all sampled frames.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => copyToClipboard(aggregateText)}
                          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
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
                          onClick={() =>
                            downloadTextFile(
                              aggregateText,
                              `${sanitizeFilename(videoFile?.name || "video")}_transcript.txt`
                            )
                          }
                          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-sm font-semibold bg-emerald-100 hover:bg-emerald-200 text-emerald-700"
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
                    <pre className="bg-white rounded-xl p-4 text-sm text-slate-800 whitespace-pre-wrap max-h-72 overflow-y-auto border border-slate-200">
                      {aggregateText}
                    </pre>
                  </div>
                )}

                {frames.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-800">
                      Frame by frame
                    </h3>
                    <div className="grid gap-4">
                      {frames.map((frame) => (
                        <div
                          key={frame.index}
                          className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 hover:border-emerald-300 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                                #{frame.index}
                              </div>
                              <div>
                                <p className="text-sm text-slate-500">
                                  Sampled frame {frame.index}
                                </p>
                                <p className="text-sm font-semibold text-slate-700">
                                  Text snapshot
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => copyToClipboard(frame.text)}
                              className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-100 text-slate-700"
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
                          </div>
                          <pre className="bg-white rounded-xl p-3 text-sm text-slate-800 whitespace-pre-wrap max-h-48 overflow-y-auto border border-slate-200">
                            {frame.text || "No text detected in this frame."}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {!processing && !hasResults && !videoFile && (
            <div className="bg-white/85 backdrop-blur-md rounded-3xl shadow-2xl border border-white/60 p-8 sm:p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-emerald-100 to-sky-100 rounded-3xl flex items-center justify-center">
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
                Turn silent videos into text
              </h3>
              <p className="text-slate-600 text-lg mb-6 max-w-2xl mx-auto">
                Upload a short clip with on-screen words. We capture key frames and merge the detected text so you can copy or download it instantly.
              </p>
              <div className="inline-flex items-center space-x-2 bg-slate-100 rounded-full px-4 py-2">
                <span className="text-slate-600 text-sm">
                  🎯 Great for tutorials, course slides, and screen recordings
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {showSuccess && (
        <Toast
          title="🎉 Video processed!"
          message="Frames analyzed and text extracted."
          gradientClass="from-emerald-500 to-sky-500"
        />
      )}

      {showError && (
        <Toast
          title="⚠️ Could not process video"
          message={errorMessage || "Please retry with a shorter clip."}
          gradientClass="from-red-500 to-pink-500"
        />
      )}
    </AppShell>
  );
}

export default withAuth(VisionVideoExtractor);
