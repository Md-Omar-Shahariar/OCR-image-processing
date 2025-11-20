export type ThemeName = "copyfish" | "vision" | "redfox";

interface ThemeConfig {
  pageGradient: string;
  headerGradient: string;
  dropzoneIdle: string;
  dropzoneActive: string;
  dropzoneAccent: string;
  buttonGradient: string;
  tipsWrapper: string;
  tipsTitle: string;
  tipsBullet: string;
  tipsText: string;
  fileListAccent?: "purple" | "blue" | "emerald";
  downloadButton?: string;
}

export const themeColors: Record<ThemeName, ThemeConfig> = {
  copyfish: {
    pageGradient: "bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50",
    headerGradient: "bg-gradient-to-r from-purple-600 to-pink-600",
    dropzoneIdle: "border-slate-300 hover:border-pink-400 hover:bg-pink-50",
    dropzoneActive: "border-pink-500 bg-pink-50 scale-105",
    dropzoneAccent: "from-purple-500 to-pink-500",
    buttonGradient: "from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
    tipsWrapper: "bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 border border-pink-200",
    tipsTitle: "text-pink-800",
    tipsBullet: "bg-pink-500",
    tipsText: "text-pink-700",
    fileListAccent: "purple",
    downloadButton: "bg-pink-100 hover:bg-pink-200 text-pink-700",
  },
  vision: {
    pageGradient: "bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50",
    headerGradient: "bg-gradient-to-r from-sky-600 to-emerald-500",
    dropzoneIdle: "border-slate-300 hover:border-emerald-400 hover:bg-emerald-50",
    dropzoneActive: "border-emerald-500 bg-emerald-50 scale-105",
    dropzoneAccent: "from-emerald-500 to-sky-500",
    buttonGradient: "from-emerald-600 to-sky-600 hover:from-emerald-600/90 hover:to-sky-600/90",
    tipsWrapper: "bg-gradient-to-br from-emerald-50 to-sky-50 rounded-2xl p-6 border border-emerald-200",
    tipsTitle: "text-emerald-800",
    tipsBullet: "bg-emerald-500",
    tipsText: "text-emerald-700",
    fileListAccent: "emerald",
    downloadButton: "bg-emerald-100 hover:bg-emerald-200 text-emerald-700",
  },
  redfox: {
    pageGradient: "bg-gradient-to-br from-slate-50 via-red-50 to-orange-50",
    headerGradient: "bg-gradient-to-r from-red-600 to-orange-600",
    dropzoneIdle: "border-slate-300 hover:border-red-400 hover:bg-red-50",
    dropzoneActive: "border-red-500 bg-red-50 scale-105",
    dropzoneAccent: "from-red-500 to-orange-500",
    buttonGradient: "from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-600",
    tipsWrapper: "bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border border-red-200",
    tipsTitle: "text-red-800",
    tipsBullet: "bg-red-500",
    tipsText: "text-red-700",
    downloadButton: "bg-red-100 hover:bg-red-200 text-red-700",
  },
};

export const getThemeNameFromEngine = (engine: string): "copyfish" | "vision" =>
  engine === "vision" ? "vision" : "copyfish";
