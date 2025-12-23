import { ReactNode } from "react";

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  path: string;
  gradient: string;
  features: string[];
  stats: string;
}

interface FeatureCardProps {
  feature: Feature;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function FeatureCard({
  feature,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: FeatureCardProps) {
  // Renders a clickable feature tile that shows an icon, summary copy, and capability list.
  return (
    <button
      type="button"
      className="group cursor-pointer text-left h-full w-full"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className={`relative bg-white rounded-3xl shadow-xl border border-white/50 backdrop-blur-sm overflow-hidden transition-all duration-500 w-full h-full hover:shadow-2xl hover:scale-105 focus:outline-none ${
          isHovered ? "ring-2 ring-offset-2 ring-blue-200" : ""
        }`}
      >
        <div
          className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r `}
        ></div>
        <div className="relative p-8 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-r ${feature.gradient} text-white shadow-lg`}
            >
              {feature.icon}
            </div>
            <span className="px-4 py-2 rounded-full bg-white/80 text-sm font-semibold text-slate-700">
              {feature.stats}
            </span>
          </div>

          <div className="flex-1">
            <h3 className="text-2xl font-bold text-slate-800 mb-3">
              {feature.title}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              {feature.description}
            </p>
          </div>

          <div className="space-y-2 text-sm">
            {feature.features.map((item) => (
              <div
                key={item}
                className="flex items-center space-x-2 text-slate-700"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}

export default FeatureCard;
