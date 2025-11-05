interface ProgressBarProps {
  value: number;
  label?: string;
  accentClass?: string;
}

export function ProgressBar({
  value,
  label = "Processing files...",
  accentClass = "from-purple-500 to-pink-500",
}: ProgressBarProps) {
  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm text-slate-600 mb-2">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
        <div
          className={`bg-gradient-to-r ${accentClass} h-3 rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${value}%` }}
          aria-live="polite"
          aria-label={`Upload progress ${value} percent`}
        ></div>
      </div>
    </div>
  );
}

export default ProgressBar;
