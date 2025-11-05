import { ButtonHTMLAttributes } from "react";

interface BackButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

export function BackButton({
  label = "Back to Home",
  className = "",
  ...props
}: BackButtonProps) {
  return (
    <button
      {...props}
      className={`group flex items-center justify-center space-x-3 bg-white/80 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${className}`}
    >
      <svg
        className="w-5 h-5 text-slate-600 group-hover:text-slate-800 transition-colors"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      <span className="font-semibold text-slate-700 group-hover:text-slate-900">
        {label}
      </span>
    </button>
  );
}

export default BackButton;
