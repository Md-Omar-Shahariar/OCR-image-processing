// components/HomePage.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import BasicAuth from "../components/BasicAuth";
import AppShell from "../components/layout/AppShell";
import FeatureCard, { Feature } from "../components/ui/FeatureCard";

type ModalType = "full" | "title";

interface ModalOption {
  id: string;
  label: string;
  description: string;
  badge?: string;
  details?: string;
  path: string;
  accent: string;
}

interface ModalConfig {
  title: string;
  subtitle: string;
  description: string;
  options: ModalOption[];
}

interface PrimaryCard {
  id: ModalType;
  title: string;
  description: string;
  gradient: string;
  accent: string;
  stats: string[];
  icon: JSX.Element;
}

function HomePageContent() {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const primaryCards: PrimaryCard[] = [
    {
      id: "full",
      title: "Full Page OCR",
      description:
        "Extract every character from scans, PDFs, and screenshots with CopyFish or Google Vision.",
      gradient: "from-blue-600 via-cyan-500 to-teal-500",
      accent: "text-cyan-100",
      stats: ["Docs & screenshots", "Up to 10MB", "Batch ready"],
      icon: (
        <svg
          className="w-10 h-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10h6m0 0a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
          />
        </svg>
      ),
    },
    {
      id: "title",
      title: "Title & Link Extractor",
      description:
        "Pull SERP titles, URLs, and snippets instantly. Swap engines per upload.",
      gradient: "from-purple-600 via-pink-500 to-rose-500",
      accent: "text-pink-100",
      stats: ["SEO & research", "Link-ready output", "Multilingual"],
      icon: (
        <svg
          className="w-10 h-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 8h10M7 12h5m7 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
  ];

  const modalContent: Record<ModalType, ModalConfig> = {
    full: {
      title: "Choose your OCR engine",
      subtitle: "Full Page OCR",
      description:
        "Send files through CopyFish for speed or route to Google Vision for document-grade accuracy.",
      options: [
        {
          id: "copyfish-full",
          label: "CopyFish (OCR.Space)",
          description: "Fast, generous 10MB limit. Perfect for everyday scans.",
          badge: "Default",
          details: "Engine 2 • Multi-file batching",
          path: "/text-extractor?engine=ocrspace",
          accent: "from-blue-500 to-cyan-500",
        },
        {
          id: "vision-full",
          label: "Google Vision",
          description:
            "Use DOCUMENT_TEXT_DETECTION for dense layouts and multilingual characters.",
          badge: "Premium",
          details: "Vision API • 4MB per file",
          path: "/text-extractor?engine=vision",
          accent: "from-emerald-500 to-sky-500",
        },
      ],
    },
    title: {
      title: "Pick how to parse SERPs",
      subtitle: "Title & Link Extractor",
      description:
        "Great SERP parsing starts with clean OCR. Choose the engine per screenshot.",
      options: [
        {
          id: "copyfish-title",
          label: "CopyFish (OCR.Space)",
          description: "Best for quick snapshots and Latin characters.",
          badge: "Default",
          details: "Up to 10MB • OCR.Space Engine 2",
          path: "/title-extractor?engine=ocrspace",
          accent: "from-purple-500 to-pink-500",
        },
        {
          id: "vision-title",
          label: "Google Vision",
          description:
            "Ideal for dense or multilingual SERPs when CopyFish struggles.",
          badge: "Vision AI",
          details: "TEXT_DETECTION • 4MB per file",
          path: "/title-extractor?engine=vision",
          accent: "from-emerald-500 to-sky-500",
        },
      ],
    },
  };

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

  const openModal = (type: ModalType) => setActiveModal(type);
  const closeModal = () => setActiveModal(null);
  const handleModalNavigate = (path: string) => {
    router.push(path);
    closeModal();
  };
  const selectedModal = activeModal ? modalContent[activeModal] : null;

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
          <div className="max-w-5xl mx-auto relative">
            <div className="md:min-h-[420px] relative">
              {primaryCards.map((card, index) => (
                <div
                  key={card.id}
                  className={`relative mb-6 md:mb-0 transition-all duration-300 ${
                    index === 0
                      ? "md:absolute md:left-0 md:top-0 md:w-[70%]"
                      : "md:absolute md:right-0 md:top-16 md:w-[70%]"
                  }`}
                >
                  <div
                    onClick={() => openModal(card.id)}
                    className={`cursor-pointer group rounded-3xl shadow-2xl p-8 lg:p-10 text-white bg-gradient-to-br ${card.gradient} ${
                      index === 0 ? "md:-rotate-1" : "md:rotate-1"
                    } hover:scale-[1.01] hover:-translate-y-2 transition-transform`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="bg-white/15 rounded-2xl p-3">
                          {card.icon}
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                            {index === 0 ? "Workspace 01" : "Workspace 02"}
                          </p>
                          <h3 className="text-2xl lg:text-3xl font-bold">
                            {card.title}
                          </h3>
                        </div>
                      </div>
                      <span className="text-sm font-semibold bg-white/20 px-4 py-2 rounded-full">
                        Tap to choose engine
                      </span>
                    </div>
                    <p className="text-base lg:text-lg text-white/80 leading-relaxed">
                      {card.description}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-6">
                      {card.stats.map((stat) => (
                        <span
                          key={stat}
                          className="bg-white/20 px-4 py-1.5 rounded-full text-sm font-semibold"
                        >
                          {stat}
                        </span>
                      ))}
                    </div>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => openModal(card.id)}
                        className="bg-white/20 border border-white/30 px-5 py-2.5 rounded-2xl font-semibold backdrop-blur-sm hover:bg-white/30 transition"
                      >
                        Choose engine
                      </button>
                      <button
                        type="button"
                        onClick={() => openModal(card.id)}
                        className="bg-black/20 border border-white/10 px-5 py-2.5 rounded-2xl font-semibold backdrop-blur-sm hover:bg-black/10 transition"
                      >
                        View workflow
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

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
                  <button
                    onClick={() => openModal("full")}
                    className="bg-white text-blue-600 hover:bg-blue-50 font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    Launch Full Page OCR
                  </button>
                  <button
                    onClick={() => openModal("title")}
                    className="border-2 border-white text-white hover:bg-white/10 font-semibold py-4 px-8 rounded-2xl transition-all duration-300 backdrop-blur-sm"
                  >
                    Review Titles & Links
                  </button>
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

      {selectedModal && (
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
              {selectedModal.subtitle}
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              {selectedModal.title}
            </h3>
            <p className="text-slate-600 mb-6">{selectedModal.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedModal.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleModalNavigate(option.path)}
                  className={`rounded-2xl border border-slate-100 text-left p-5 bg-gradient-to-br ${option.accent} text-white shadow-lg hover:-translate-y-1 transition-transform`}
                >
                  <div className="flex items-center justify-between mb-3">
                    {option.badge && (
                      <span className="text-xs uppercase tracking-wide bg-white/25 px-2 py-0.5 rounded-full font-semibold">
                        {option.badge}
                      </span>
                    )}
                    {option.details && (
                      <span className="text-[11px] text-white/80">
                        {option.details}
                      </span>
                    )}
                  </div>
                  <div className="text-xl font-semibold mb-2">
                    {option.label}
                  </div>
                  <p className="text-sm text-white/80">{option.description}</p>
                </button>
              ))}
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
