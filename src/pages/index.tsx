// components/HomePage.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import BasicAuth from "../components/BasicAuth";
import AppShell from "../components/layout/AppShell";
import FeatureCard, { Feature } from "../components/ui/FeatureCard";

function HomePageContent() {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const features: Feature[] = [
    {
      id: "fullpage",
      title: "Full Page OCR",
      description:
        "Extract text from entire images with CopyFish (OCR.Space) or switch to Google Vision for document-grade accuracy.",
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
            d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
          />
        </svg>
      ),
      path: "/text-extractor",
      gradient: "from-blue-500 to-cyan-500",
      features: [
        "CopyFish / Google Vision toggle",
        "Multi-file upload",
        "Drag & drop",
        "Real-time preview",
      ],
      stats: "95%+ accuracy",
    },
    {
      id: "title",
      title: "Title & Link Extractor",
      description:
        "AI-powered extraction of titles and URLs from search results with a CopyFish or Google Vision switch per upload.",
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
      path: "/title-extractor",
      gradient: "from-purple-500 to-pink-500 ",
      features: [
        "Smart detection",
        "URL extraction",
        "Structured data",
        "Export ready",
      ],
      stats: "AI-powered",
    },
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

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-16">
            {features.map((feature) => (
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
          {/* Quick Stats */}
          {/* <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 p-8 mb-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  99%
                </div>
                <div className="text-slate-600 text-sm">Accuracy Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  50K+
                </div>
                <div className="text-slate-600 text-sm">Images Processed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  0.5s
                </div>
                <div className="text-slate-600 text-sm">Average Processing</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  24/7
                </div>
                <div className="text-slate-600 text-sm">System Uptime</div>
              </div>
            </div>
          </div> */}

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
                  {[
                    {
                      label: "Launch Full Page OCR",
                      onClick: () => navigateTo("/text-extractor"),
                      className:
                        "bg-white text-blue-600 hover:bg-blue-50 font-semibold",
                    },
                    {
                      label: "Review Titles & Links",
                      onClick: () => navigateTo("/title-extractor"),
                      className:
                        "border-2 border-white text-white hover:bg-white/10 font-semibold",
                    },
                  ].map((btn) => (
                    <button
                      key={btn.label}
                      onClick={btn.onClick}
                      className={`${btn.className} py-4 px-8 rounded-2xl transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5`}
                    >
                      {btn.label}
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
