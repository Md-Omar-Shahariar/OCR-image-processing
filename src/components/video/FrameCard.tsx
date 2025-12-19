import { FrameOcrResult } from "@/types/type";

interface FrameCardProps {
  frame: FrameOcrResult;
}

function FrameCard({ frame }: FrameCardProps) {
  const previewText = frame.text?.trim() || "No detected text on this frame.";
  const wordCount = previewText.split(/\s+/).filter(Boolean).length;

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-emerald-100/70 bg-white/90 backdrop-blur shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/50 via-transparent to-sky-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="flex items-center justify-between px-4 pt-4 text-xs font-semibold text-slate-600">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 border border-emerald-100 text-emerald-700 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Frame #{frame.index}</span>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 border border-slate-200 text-slate-600 backdrop-blur">
          <svg
            className="h-4 w-4 text-emerald-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5h12M9 3v2m-5 6h12m-6-2v2m-5 6h12m-6-2v2"
            />
          </svg>
          <span>
            {wordCount} word{wordCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="relative mx-4 mt-3 overflow-hidden rounded-2xl border border-white/60 bg-slate-100 aspect-video">
        {frame.imageDataUrl ? (
          <img
            src={frame.imageDataUrl}
            alt={`Frame ${frame.index}`}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">
            No image available
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/0 to-transparent"></div>
        <div className="pointer-events-none absolute inset-0 opacity-60 mix-blend-soft-light bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.2),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.18),transparent_30%)]"></div>
      </div>

    </div>
  );
}

export default FrameCard;
