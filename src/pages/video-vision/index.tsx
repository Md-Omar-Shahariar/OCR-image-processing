import { useRouter } from "next/router";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { GetStaticPropsContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { withAuth } from "../../components/withAuth";
import AppShell from "../../components/layout/AppShell";
import PageHeaderCard from "../../components/ui/PageHeaderCard";
import UploadDropzone from "../../components/upload/UploadDropzone";
import FileList from "../../components/upload/FileList";
import ProgressBar from "../../components/ui/ProgressBar";
import Toast from "../../components/feedback/Toast";
import FrameCard from "../../components/video/FrameCard";
import { FrameOcrResult, SearchResult } from "@/types/type";

const SUPPORTED_LANGUAGES = [
  { code: "eng", labelKey: "language.english" },
  { code: "jpn", labelKey: "language.japanese" },
  { code: "chi", labelKey: "language.chinese" },
  { code: "kor", labelKey: "language.korean" },
];

function VisionVideoExtractor() {
  const router = useRouter();
  const { t } = useTranslation("common");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("eng");
  const [frames, setFrames] = useState<FrameOcrResult[]>([]);
  const [aggregateText, setAggregateText] = useState("");
  const [aggregatedResults, setAggregatedResults] = useState<SearchResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const languageOptions = useMemo(
    () =>
      SUPPORTED_LANGUAGES.map((lang) => ({
        ...lang,
        label: t(lang.labelKey),
      })),
    [t]
  );

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
    setAggregatedResults([]);
  };

  const onFilesChange = (files: File[]) => {
    setVideoFile(files[0] ?? null);
    setFrames([]);
    setAggregateText("");
    setErrorMessage("");
    setAggregatedResults([]);
  };

  const removeFile = () => {
    resetWorkspace();
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      throw new Error("Navigator clipboard unavailable");
    } catch (error) {
      // Fallback for browsers/environments without async clipboard API.
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.top = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        return true;
      } catch (fallbackError) {
        console.error("Clipboard copy failed", fallbackError || error);
        return false;
      }
    }
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
        setAggregatedResults(data.searchResults || []);
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

  const hasResults =
    frames.length > 0 || aggregateText.length > 0 || aggregatedResults.length > 0;

  const resultsSummary = t("videoVision.processed.summary", {
    frames: frames.length,
    frameSuffix: frames.length === 1 ? "" : "s",
    links: aggregatedResults.length,
    linkSuffix: aggregatedResults.length === 1 ? "" : "s",
  });

  const resultsCountText = t("videoVision.processed.resultsCount", {
    count: aggregatedResults.length,
  });

  const goHome = () => router.push("/");

  return (
    <AppShell gradient="bg-gradient-to-br from-slate-50 via-sky-50 to-emerald-50">
      <div className="relative z-10">
        <div className="max-w-6xl mx-auto px-4 pt-8 pb-6">
          <PageHeaderCard
            onBack={goHome}
            title={t("videoVision.title")}
            subtitle={t("videoVision.subtitle")}
            stats={[
              { label: t("videoVision.stats.engine"), value: t("videoVision.stats.engineValue") },
              { label: t("videoVision.stats.frames"), value: t("videoVision.stats.framesValue") },
            ]}
          />

          <div className="bg-white/85 backdrop-blur-md rounded-3xl shadow-2xl border border-white/60 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
              <div className="relative z-10">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                  {t("videoVision.hero.title")}
                </h1>
                <p className="text-blue-50 text-base sm:text-lg max-w-3xl">
                  {t("videoVision.hero.subtitle")}
                </p>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  {[
                    { label: t("videoVision.hero.idealLabel"), value: t("videoVision.hero.idealValue") },
                    { label: t("videoVision.hero.samplingLabel"), value: t("videoVision.hero.samplingValue") },
                    { label: t("videoVision.hero.outputLabel"), value: t("videoVision.hero.outputValue") },
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
                        {t("videoVision.form.heading")}
                      </h2>
                      <p className="text-slate-600">
                        {t("videoVision.form.description")}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      <label className="flex flex-col space-y-2 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                        <span className="text-sm font-semibold text-slate-700">
                          {t("videoVision.form.languageLabel")}
                        </span>
                        <select
                          value={language}
                          onChange={(event) => setLanguage(event.target.value)}
                          className="border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                        >
                          {languageOptions.map((lang) => {
                            const label = lang.label || lang.labelKey;
                            return (
                              <option key={lang.code} value={lang.code}>
                                {label}
                              </option>
                            );
                          })}
                        </select>
                        <span className="text-xs text-slate-500">
                          {t("videoVision.form.languageHelp")}
                        </span>
                      </label>
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                        <div className="text-sm font-semibold text-slate-700 mb-1">
                          {t("videoVision.form.samplingRules")}
                        </div>
                        <ul className="text-sm text-slate-600 space-y-1">
                          <li>• {t("videoVision.form.ruleOne")}</li>
                          <li>• {t("videoVision.form.ruleTwo")}</li>
                          <li>• {t("videoVision.form.ruleThree")}</li>
                        </ul>
                      </div>
                    </div>

                    <UploadDropzone
                      files={videoFile ? [videoFile] : []}
                      processing={processing}
                      helperText={t("videoVision.form.helperText")}
                      maxSizeCopy={t("videoVision.form.maxSizeCopy")}
                      onFilesChange={onFilesChange}
                      onClearWorkspace={resetWorkspace}
                      isClearDisabled={!videoFile && !hasResults}
                      accept="video/*"
                      browseLabel={t("videoVision.form.browseLabel")}
                      clearLabel={t("videoVision.form.clearLabel")}
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
                          <span>{t("videoVision.form.processing")}</span>
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
                          <span>{t("videoVision.form.cta")}</span>
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
                      <span>{t("videoVision.best.title")}</span>
                    </h4>
                    <ul className="space-y-2 text-sm text-emerald-800">
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        <span>{t("videoVision.best.tip1")}</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        <span>{t("videoVision.best.tip2")}</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        <span>{t("videoVision.best.tip3")}</span>
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
                    <span>🎉 {t("videoVision.processed.title")}</span>
                  </h2>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-center">
                    <span className="text-white font-semibold">{resultsSummary}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-6">
                {aggregatedResults.length > 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">
                          {t("videoVision.processed.extractedTitle")}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {t("videoVision.processed.extractedSubtitle")}
                        </p>
                      </div>
                      <div className="text-sm font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                        {resultsCountText}
                      </div>
                    </div>
                    <div className="grid gap-4">
                      {aggregatedResults.map((result, index) => (
                        <div
                          key={`${result.url}-${index}`}
                          className="bg-white border border-slate-200 rounded-xl p-4 hover:border-emerald-300 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-xs font-semibold text-slate-500 mb-1">
                                {t("videoVision.processed.resultLabel", { index: index + 1 })}
                              </div>
                              <div className="text-slate-800 font-semibold text-lg">
                                {result.title}
                              </div>
                              {result.description && (
                                <p className="text-sm text-slate-600 mt-2">{result.description}</p>
                              )}
                              <a
                                href={result.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:text-emerald-700 text-sm break-all inline-flex items-center space-x-2 mt-2"
                              >
                                <span>{result.url}</span>
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
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                  />
                                </svg>
                              </a>
                            </div>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  `${result.title}\n${result.url}${
                                    result.description ? `\n${result.description}` : ""
                                  }`
                                )
                              }
                              className="text-slate-400 hover:text-emerald-600 transition-colors p-2"
                              title={t("videoVision.processed.copy")}
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
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {aggregateText && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">
                          {t("videoVision.processed.combinedTitle")}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {t("videoVision.processed.combinedSubtitle")}
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
                          <span>{t("videoVision.processed.copyLabel")}</span>
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
                          <span>{t("videoVision.processed.downloadLabel")}</span>
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
                      {t("videoVision.processed.frameByFrame")}
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {frames.map((frame) => (
                        <FrameCard key={frame.index} frame={frame} />
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
                {t("videoVision.empty.title")}
              </h3>
              <p className="text-slate-600 text-lg mb-6 max-w-2xl mx-auto">
                {t("videoVision.empty.subtitle")}
              </p>
              <div className="inline-flex items-center space-x-2 bg-slate-100 rounded-full px-4 py-2">
                <span className="text-slate-600 text-sm">
                  {t("videoVision.empty.tagline")}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {showSuccess && (
        <Toast
          title={t("videoVision.toast.successTitle")}
          message={t("videoVision.toast.successMessage")}
          gradientClass="from-emerald-500 to-sky-500"
        />
      )}

      {showError && (
        <Toast
          title={t("videoVision.toast.errorTitle")}
          message={errorMessage || t("videoVision.toast.errorMessage")}
          gradientClass="from-red-500 to-pink-500"
        />
      )}
    </AppShell>
  );
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", ["common"])),
    },
  };
}

export default withAuth(VisionVideoExtractor);
