import { ReactNode } from "react";

interface ToastProps {
  title: string;
  message: string;
  gradientClass?: string;
  icon?: ReactNode;
}

export function Toast({
  title,
  message,
  gradientClass = "from-green-500 to-emerald-500",
  icon,
}: ToastProps) {
  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 z-50 animate-slide-up max-w-md sm:max-w-none mx-auto sm:mx-0">
      <div
        className={`bg-gradient-to-r ${gradientClass} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-4 backdrop-blur-md`}
      >
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          {icon ?? (
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
        <div>
          <div className="font-bold">{title}</div>
          <div className="text-sm text-white/80">{message}</div>
        </div>
      </div>
    </div>
  );
}

export default Toast;
