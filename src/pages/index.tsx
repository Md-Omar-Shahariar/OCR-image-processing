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
  const [activeCard, setActiveCard] = useState<EngineCardId | null>(null);

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const engineCards: Record<EngineCardId, EngineCard> = {
    "full-copyfish": {
      id: "full-copyfish",
      label: "Full Page · CopyFish",
      summary: "Use OCR.Space / CopyFish for fast, generous 10MB batches.",
      gradient: "from-blue-600 via-cyan-500 to-teal-500",
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
      id: "vision",
      title: "Google Vision Title Extractor",
      description:
        "Use Google Cloud Vision to pull titles, URLs, and snippets from dense multilingual SERP screenshots.",
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
            d="M12 8c-2.21 0-4 1.79-4 4m4-4c2.21 0 4 1.79 4 4m-4-4V4m0 4v12m-7-4h14m-14 0l2.5 3m-2.5-3l2.5-3m11 3l-2.5 3m2.5-3l-2.5-3"
          />
        </svg>
      ),
      path: "/vision-extractor",
      gradient: "from-sky-500 to-emerald-500",
      features: [
        "Google Vision OCR",
        "Title/URL/Description",
        "Dense SERP support",
        "Multilingual",
      ],
      stats: "Cloud Vision",
    },
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

  const openModal = (cardId: EngineCardId) => setActiveCard(cardId);
  const closeModal = () => setActiveCard(null);
  const handleLaunch = (path: string) => {
    router.push(path);
    closeModal();
  };
  const selectedCard = activeCard ? engineCards[activeCard] : null;

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

        {/* Engine Selector Cards */}
        <div className="max-w-7xl mx-auto px-4 pb-16 space-y-16">
          {workflowSections.map((section) => (
            <div
              key={section.id}
              className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/60 p-6 sm:p-10"
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
                <div className="flex gap-3">
                  {section.cards.map((cardId) => (
                    <span
                      key={cardId}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500"
                    >
                      {engineCards[cardId].badge}
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative mt-8 space-y-6 md:space-y-0 md:min-h-[320px]">
                {section.cards.map((cardId, index) => {
                  const card = engineCards[cardId];
                  const positionClasses =
                    index === 0
                      ? "md:absolute md:left-4 md:top-0 md:w-2/3 md:-rotate-1"
                      : "md:absolute md:right-4 md:top-12 md:w-2/3 md:rotate-1";
                  return (
                    <div
                      key={card.id}
                      className={`transition-all duration-300 ${positionClasses}`}
                    >
                      <div
                        onClick={() => openModal(card.id)}
                        className={`cursor-pointer rounded-3xl shadow-2xl p-6 sm:p-8 text-white bg-gradient-to-br ${card.gradient} hover:scale-[1.01] hover:-translate-y-2 transition-transform`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                              {section.title}
                            </p>
                            <h4 className="text-xl sm:text-2xl font-bold mt-1">
                              {card.label}
                            </h4>
                          </div>
                          <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">
                            {card.details}
                          </span>
                        </div>
                        <p className="text-white/85">{card.summary}</p>
                        <div className="flex flex-wrap gap-2 mt-4">
                          {card.chips.map((chip) => (
                            <span
                              key={chip}
                              className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold"
                            >
                              {chip}
                            </span>
                          ))}
                        </div>
                        <div className="mt-6">
                          <button
                            type="button"
                            onClick={() => openModal(card.id)}
                            className="bg-white/10 border border-white/20 px-5 py-2.5 rounded-2xl font-semibold backdrop-blur-sm hover:bg-white/20 transition"
                          >
                            View & launch
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

          {/* CTA Section */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl shadow-2xl p-12 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-black/5"></div>
              <div className="relative z-10">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Ready to Transform Your Images?
                </h2>
                <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                  Join thousands of users who trust our tools for their image
                  processing needs. No credit card required.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {workflowSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => openModal(section.cards[0])}
                      className={`${
                        section.id === "full"
                          ? "bg-white text-blue-600 hover:bg-blue-50"
                          : "border-2 border-white text-white hover:bg-white/10"
                      } font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5`}
                    >
                      {section.id === "full"
                        ? "Launch Full Page OCR"
                        : "Review Titles & Links"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
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

      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
            onClick={closeModal}
            aria-label="Close engine selector"
          ></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl p-6 sm:p-8">
            <button
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-800"
              onClick={closeModal}
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
              {selectedCard.badge} workflow
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              {selectedCard.label}
            </h3>
            <p className="text-slate-600 mb-6">{selectedCard.summary}</p>

            <div className="bg-gradient-to-br rounded-3xl p-6 text-white shadow-xl bg-slate-900">
              <p className="text-sm uppercase tracking-[0.3em] text-white/70 mb-2">
                Key benefits
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCard.chips.map((chip) => (
                  <span
                    key={chip}
                    className="bg-white/10 px-3 py-1 rounded-full text-xs font-semibold"
                  >
                    {chip}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white/70">
                  {selectedCard.details}
                </span>
                <button
                  onClick={() => handleLaunch(selectedCard.path)}
                  className="bg-white text-slate-900 px-5 py-2 rounded-2xl font-semibold hover:bg-slate-100 transition"
                >
                  Launch workspace
                </button>
              </div>
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
