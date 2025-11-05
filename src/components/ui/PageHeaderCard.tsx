import { ReactNode } from "react";
import BackButton from "./BackButton";

interface Stat {
  label: string;
  value: string;
}

interface PageHeaderCardProps {
  title: string;
  subtitle: string;
  stats?: Stat[];
  onBack?: () => void;
  actionArea?: ReactNode;
}

export function PageHeaderCard({
  title,
  subtitle,
  stats = [],
  onBack,
  actionArea,
}: PageHeaderCardProps) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-8">
      {onBack && (
        <BackButton
          onClick={onBack}
          aria-label="Go back to previous page"
          className="w-full sm:w-auto"
        />
      )}
      <div className="text-center sm:text-right bg-white/80 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/50 shadow-lg w-full sm:w-auto">
        <div className="text-xl sm:text-lg font-bold text-slate-800">
          {title}
        </div>
        <div className="text-sm text-slate-600">{subtitle}</div>
        {stats.length > 0 && (
          <div className="mt-4 grid grid-cols-1 xs:grid-cols-2 gap-2 text-left sm:text-right text-xs text-slate-500">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-slate-100 rounded-xl px-3 py-2 text-center sm:text-right"
              >
                <div className="font-semibold text-slate-800 text-sm mb-0.5">
                  {stat.label}
                </div>
                {stat.value}
              </div>
            ))}
          </div>
        )}
        {actionArea && <div className="mt-4">{actionArea}</div>}
      </div>
    </div>
  );
}

export default PageHeaderCard;
