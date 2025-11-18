type AccentColor = "purple" | "blue" | "emerald";

interface FileListProps {
  files: File[];
  onRemoveFile: (index: number) => void;
  accentColor?: AccentColor;
}

const accentClasses: Record<AccentColor, { badge: string; iconBg: string }> = {
  purple: {
    badge: "bg-purple-100 text-purple-600",
    iconBg: "bg-purple-100 text-purple-600",
  },
  blue: {
    badge: "bg-blue-100 text-blue-600",
    iconBg: "bg-blue-100 text-blue-600",
  },
  emerald: {
    badge: "bg-emerald-100 text-emerald-600",
    iconBg: "bg-emerald-100 text-emerald-600",
  },
};

export function FileList({
  files,
  onRemoveFile,
  accentColor = "purple",
}: FileListProps) {
  const accent = accentClasses[accentColor];

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
        <span>📄 Selected Files</span>
        <span className={`text-sm px-3 py-1 rounded-full ${accent.badge}`}>
          {files.length}
        </span>
      </h3>
      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {files.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="flex items-center justify-between bg-white rounded-xl p-4 border border-slate-200 hover:border-purple-300 transition-all duration-300 hover:shadow-md group/item"
          >
            <div className="flex items-center space-x-4">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent.iconBg}`}
              >
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-slate-800 font-medium text-sm truncate max-w-[150px] sm:max-w-xs">
                  {file.name}
                </div>
                <div className="text-slate-500 text-xs">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onRemoveFile(index);
              }}
              className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
              aria-label={`Remove ${file.name}`}
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
  );
}

export default FileList;
