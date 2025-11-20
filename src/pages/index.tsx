// components/HomePage.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import BasicAuth from "../components/BasicAuth";
import AppShell from "../components/layout/AppShell";
import FeatureCard, { Feature } from "../components/ui/FeatureCard";

type EngineCardId =
  | "full-copyfish"
  | "full-vision"
  | "title-copyfish"
  | "title-vision";

interface EngineCard {
  id: EngineCardId;
  label: string;
  summary: string;
  gradient: string;
  path: string;
  badge: string;
  details: string;
  chips: string[];
}

interface WorkflowSection {
  id: string;
  badge: string;
  title: string;
  description: string;
  cards: EngineCardId[];
}

function HomePageContent() {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const engineCards: Record<EngineCardId, EngineCard> = {
    "full-copyfish": {
      id: "full-copyfish",
      label: "Full Page · CopyFish",
      summary: "Use OCR.Space / CopyFish for fast, generous 10MB batches.",
      gradient: "from-purple-600 via-pink-500 to-rose-500",
      path: "/text-extractor?engine=ocrspace",
      badge: "CopyFish",
      details: "Engine 2 • Multi-file batching",
      chips: ["Default", "Up to 10MB", "Batch ready"],
    },
    "full-vision": {
      id: "full-vision",
      label: "Full Page · Google Vision",
      summary:
        "Route scans to DOCUMENT_TEXT_DETECTION for column-heavy layouts.",
      gradient: "from-emerald-500 via-sky-500 to-blue-500",
      path: "/text-extractor?engine=vision",
      badge: "Vision",
      details: "4MB limit • DOCUMENT_TEXT_DETECTION",
      chips: ["Multilingual", "Premium OCR", "Best accuracy"],
    },
    "title-copyfish": {
      id: "title-copyfish",
      label: "Title Extractor · CopyFish",
      summary: "Great for quick SERP screenshots with Latin characters.",
      gradient: "from-purple-600 via-pink-500 to-rose-500",
      path: "/title-extractor?engine=ocrspace",
      badge: "CopyFish",
      details: "Engine 2 • Up to 10MB",
      chips: ["SEO research", "Fast parsing", "Link-ready"],
    },
    "title-vision": {
      id: "title-vision",
      label: "Title Extractor · Google Vision",
      summary:
        "Use TEXT_DETECTION when CopyFish misses dense, multilingual SERPs.",
      gradient: "from-emerald-500 via-teal-500 to-sky-500",
      path: "/title-extractor?engine=vision",
      badge: "Vision",
      details: "4MB limit • TEXT_DETECTION",
      chips: ["Multilingual", "High confidence", "SERP focused"],
    },
  };

  const workflowSections: WorkflowSection[] = [
    {
      id: "full",
      badge: "Workspace · 01",
      title: "Full Page OCR",
      description:
        "Choose between CopyFish speed or Google Vision accuracy before you upload.",
      cards: ["full-copyfish", "full-vision"],
    },
    {
      id: "title",
      badge: "Workspace · 02",
      title: "Title & Link Extractor",
      description:
        "Pick the engine that best matches your SERP screenshots and jump straight into extraction.",
      cards: ["title-copyfish", "title-vision"],
    },
  ];

  const secondaryFeatures: Feature[] = [
    {
      id: "redbox",
      title: "Red Box Detector",
      description:
        "Advanced computer vision that detects and extracts text from red bounding boxes with precision.",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
          />
        </svg>
      ),
      path: "/redbox",
      gradient: "from-red-500 to-orange-500",
      features: [
        "OpenCV powered",
        "Box detection",
        "Text extraction",
        "High precision",
      ],
      stats: "Computer Vision",
    },
  ];

  const handleLaunch = (path: string) => router.push(path);
  const selectedSection = activeSection
    ? workflowSections.find((section) => section.id === activeSection)
    : null;

  return (
    <AppShell
      gradient="bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50"
      overlay={
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100 to-transparent animate-pulse"></div>
        </div>
      }
    >
      <div className="relative z-10">
        {/* Header */}
        <div className="text-center pt-16 pb-12 px-4">
          <div className="inline-flex items-center space-x-3 bg-white/70 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/50 shadow-lg mb-8">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-150"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-300"></div>
            </div>
            <span className="text-sm font-semibold text-slate-700">
              All Systems Operational
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Image Processing
            <span className="block text-3xl md:text-4xl text-slate-600 mt-2">
              Made Simple & Powerful
            </span>
          </h1>

          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
            Transform images into actionable text with our AI-powered tools.
            <span className="block text-sm text-slate-500 mt-2">
              Fast, accurate, and incredibly easy to use
            </span>
          </p>

          <div className="w-32 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full shadow-lg"></div>
        </div>

        {/* Engine Selector Albums */}
        <div className="max-w-7xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {workflowSections.map((section) => (
              <div
                key={section.id}
                className="bg-white/85 backdrop-blur-md rounded-3xl shadow-xl border border-white/60 p-6 sm:p-8"
              >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                    {section.badge}
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                    {section.title}
                  </h3>
                  <p className="text-slate-600 mt-2">{section.description}</p>
                </div>
                <button
                  onClick={() => setActiveSection(section.id)}
                  className="inline-flex items-center text-sm font-semibold bg-slate-900 text-white px-4 py-2 rounded-2xl hover:bg-slate-800 transition"
                >
                  Choose engine
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>

              <div
                className="relative mt-8 h-48 sm:h-56 cursor-pointer"
                onClick={() => setActiveSection(section.id)}
              >
                {section.cards.map((cardId, index) => {
                  const card = engineCards[cardId];
                  const offset =
                    index === 0 ? "left-0 top-2 rotate-[-3deg]" : "left-6 top-8 rotate-[4deg]";
                  return (
                    <div
                      key={card.id}
                      className={`absolute w-3/4 sm:w-2/3 lg:w-1/2 ${offset} drop-shadow-2xl transition-transform`}
                    >
                      <div className={`rounded-2xl p-4 sm:p-5 bg-gradient-to-br ${card.gradient} text-white`}>
                        <p className="text-[11px] uppercase tracking-[0.3em] text-white/70">
                          {card.badge}
                        </p>
                        <h4 className="text-lg font-semibold mt-1">{card.label}</h4>
                        <p className="text-xs text-white/80 mt-2 line-clamp-2">
                          {card.summary}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {secondaryFeatures.map((feature) => (
              <FeatureCard
                key={feature.id}
                feature={feature}
                isHovered={hoveredCard === feature.id}
                onMouseEnter={() => setHoveredCard(feature.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => navigateTo(feature.path)}
              />
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="bg-white/80 backdrop-blur-md border-t border-white/50 py-8">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex flex-wrap justify-center gap-8 mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-slate-700">
                  OCR Engine
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-slate-700">
                  AI Processing
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-slate-700">
                  Title Extraction
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-slate-700">
                  Vision Systems
                </span>
              </div>
            </div>
            <p className="text-slate-600 text-sm">
              Image Processing Suite • Powered by Advanced AI Technology •
              v2.3.7
            </p>
          </div>
        </div>
      </div>

      {selectedSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
            onClick={() => setActiveSection(null)}
          ></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 sm:p-8">
            <button
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-800"
              onClick={() => setActiveSection(null)}
              aria-label="Close modal"
            >
              <svg
                className="w-6 h-6"
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

            <p className="text-xs uppercase tracking-[0.4em] text-slate-400 mb-2">
              {selectedSection.badge}
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              {selectedSection.title}
            </h3>
            <p className="text-slate-600 mb-6">{selectedSection.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedSection.cards.map((cardId) => {
                const card = engineCards[cardId];
                return (
                  <button
                    key={card.id}
                    onClick={() => handleLaunch(card.path)}
                    className={`text-left rounded-2xl border border-slate-100 p-5 bg-gradient-to-br ${card.gradient} text-white shadow-lg hover:-translate-y-1 transition-transform`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs uppercase tracking-wide bg-white/25 px-2 py-0.5 rounded-full font-semibold">
                        {card.badge}
                      </span>
                      <span className="text-[11px] text-white/80">{card.details}</span>
                    </div>
                    <div className="text-xl font-semibold mb-2">{card.label}</div>
                    <p className="text-sm text-white/80 line-clamp-3">{card.summary}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default function HomePage() {
  return (
    <BasicAuth>
      <HomePageContent />
    </BasicAuth>
  );
}
