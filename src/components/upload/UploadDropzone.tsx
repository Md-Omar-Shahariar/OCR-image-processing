import {
  ChangeEvent,
  DragEvent,
  KeyboardEvent,
  useRef,
  useState,
} from "react";

interface UploadDropzoneProps {
  files: File[];
  processing?: boolean;
  helperText: string;
  maxSizeCopy?: string;
  accentGradient?: string;
  idleClasses?: string;
  activeClasses?: string;
  browseLabel?: string;
  clearLabel?: string;
  onFilesChange: (files: File[]) => void;
  onClearWorkspace?: () => void;
  accept?: string;
  isClearDisabled?: boolean;
}

export function UploadDropzone({
  files,
  processing = false,
  helperText,
  maxSizeCopy = "Supports JPG, PNG, BMP • Maximum 1MB per file",
  accentGradient = "from-purple-500 to-pink-500",
  idleClasses = "border-slate-300 hover:border-purple-400 hover:bg-purple-50",
  activeClasses = "border-purple-500 bg-purple-50 scale-105",
  browseLabel = "Browse files",
  clearLabel = "Clear workspace",
  onFilesChange,
  onClearWorkspace,
  accept = "image/*",
  isClearDisabled,
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const updateFiles = (list: FileList | File[]) => {
    const validFiles = Array.from(list).filter((file) =>
      accept.includes("image") ? file.type.startsWith("image/") : true
    );
    if (validFiles.length > 0) {
      onFilesChange(validFiles);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer?.files) {
      updateFiles(event.dataTransfer.files);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      updateFiles(event.target.files);
    }
  };

  const triggerFileInput = () => inputRef.current?.click();

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      triggerFileInput();
    }
  };

  return (
    <div
      className={`relative border-3 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all duration-500 cursor-pointer mb-6 group focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-200 ${
        isDragging ? activeClasses : idleClasses
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={triggerFileInput}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label="Upload images by clicking or dragging files"
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="max-w-md mx-auto">
        <div
          className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-r ${accentGradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}
        >
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
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-3">
          {files.length > 0
            ? `📁 ${files.length} file${
                files.length > 1 ? "s" : ""
              } selected`
            : processing
            ? "🔄 Processing your files..."
            : "✨ Drop images here or click to browse"}
        </h3>

        <p className="text-slate-500 text-sm mb-4">{maxSizeCopy}</p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mb-4">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              triggerFileInput();
            }}
            className="px-4 py-2 rounded-full bg-white text-purple-600 font-semibold shadow-sm border border-purple-100 hover:bg-purple-50 transition"
          >
            {browseLabel}
          </button>
          {onClearWorkspace && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onClearWorkspace();
              }}
              className="px-4 py-2 rounded-full bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200 transition"
              disabled={
                typeof isClearDisabled === "boolean"
                  ? isClearDisabled
                  : files.length === 0
              }
            >
              {clearLabel}
            </button>
          )}
        </div>

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
          <span className="text-slate-600 text-sm">{helperText}</span>
        </div>
      </div>
    </div>
  );
}

export default UploadDropzone;
