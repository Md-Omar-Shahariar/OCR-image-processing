// // components/HomePage.tsx
// "use client";
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import BasicAuth from "../components/BasicAuth";

// function HomePageContent() {
//   const router = useRouter();
//   const [hoveredButton, setHoveredButton] = useState<string | null>(null);

//   const navigateTo = (path: string) => {
//     router.push(path);
//   };

//   return (
//     <main className="min-h-screen bg-gray-900 text-white p-6 font-mono relative overflow-hidden">
//       {/* Background Effects */}
//       <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 opacity-90 z-0"></div>
//       <div className="fixed inset-0 bg-grid-pattern opacity-10 z-0"></div>

//       {/* Animated Glow Lines */}
//       <div className="fixed top-0 left-1/4 w-1/2 h-1 blur-md bg-cyan-500 opacity-30 animate-pulse z-0"></div>
//       <div className="fixed bottom-0 left-1/3 w-1/3 h-1 blur-md bg-purple-500 opacity-30 animate-pulse z-0"></div>
//       <div className="fixed top-1/2 right-0 w-1 h-32 blur-md bg-red-500 opacity-30 animate-pulse z-0"></div>

//       {/* Floating Orbs */}
//       <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow z-0"></div>
//       <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow z-0"></div>
//       <div className="fixed top-1/2 left-1/2 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse-slow z-0"></div>

//       <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
//         {/* Main Title */}
//         <div className="text-center mb-12">
//           <h1 className="text-5xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-red-400 tracking-wider">
//             <span className="text-cyan-300">{"{"}</span>
//             OCR_VISION_SUITE
//             <span className="text-cyan-300">{"}"}</span>
//           </h1>
//           <p className="text-gray-400 text-lg font-mono">
//             ADVANCED_IMAGE_PROCESSING_SYSTEMS
//           </p>
//           <div className="h-1 w-80 mx-auto mt-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-red-500 shadow-lg shadow-cyan-500/30"></div>
//         </div>

//         {/* Feature Cards Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-12">
//           {/* Full Page OCR Card */}
//           <div
//             className={`relative group cursor-pointer transition-all duration-500 ${
//               hoveredButton === "fullpage" ? "scale-105" : "scale-100"
//             }`}
//             onMouseEnter={() => setHoveredButton("fullpage")}
//             onMouseLeave={() => setHoveredButton(null)}
//             onClick={() => navigateTo("/text-extractor")}
//           >
//             <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-300"></div>
//             <div className="relative bg-gray-800 rounded-xl p-8 border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 h-full">
//               <div className="text-center">
//                 <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
//                   <svg
//                     className="w-8 h-8 text-white"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
//                     />
//                   </svg>
//                 </div>
//                 <h3 className="text-2xl font-bold text-cyan-300 mb-3 group-hover:text-cyan-200 transition-colors">
//                   FULL_PAGE_OCR
//                 </h3>
//                 <p className="text-gray-400 text-sm leading-relaxed mb-6">
//                   Extract text from entire images with high accuracy. Supports
//                   multiple file uploads, drag & drop, and batch processing with
//                   real-time results.
//                 </p>
//                 <div className="space-y-2 text-xs text-cyan-600">
//                   <div>• MULTI_FILE_UPLOAD</div>
//                   <div>• DRAG_&_DROP_SUPPORT</div>
//                   <div>• BATCH_PROCESSING</div>
//                   <div>• REAL_TIME_RESULTS</div>
//                 </div>
//               </div>
//             </div>
//             <div
//               className={`absolute top-4 right-4 w-3 h-3 bg-cyan-400 rounded-full animate-pulse ${
//                 hoveredButton === "fullpage" ? "opacity-100" : "opacity-50"
//               }`}
//             ></div>
//           </div>

//           {/* Full Page OCR Title Card - UPDATED DESIGN */}
//           <div
//             className={`relative group cursor-pointer transition-all duration-500 ${
//               hoveredButton === "title" ? "scale-105" : "scale-100"
//             }`}
//             onMouseEnter={() => setHoveredButton("title")}
//             onMouseLeave={() => setHoveredButton(null)}
//             onClick={() => navigateTo("/title-extractor")}
//           >
//             {/* Golden gradient glow effect */}
//             <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 via-orange-500 to-amber-500 rounded-xl blur opacity-40 group-hover:opacity-80 transition duration-300"></div>

//             {/* Main card with golden border */}
//             <div className="relative bg-gray-800 rounded-xl p-8 border-2 border-amber-500/40 hover:border-amber-400/70 transition-all duration-300 h-full backdrop-blur-sm">
//               {/* Decorative corner accents */}
//               <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-amber-400 rounded-tl-xl"></div>
//               <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-amber-400 rounded-tr-xl"></div>
//               <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-amber-400 rounded-bl-xl"></div>
//               <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-amber-400 rounded-br-xl"></div>

//               <div className="text-center relative z-10">
//                 {/* Golden icon with sparkle effect */}
//                 <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-amber-500/30 relative">
//                   <svg
//                     className="w-8 h-8 text-gray-900"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
//                     />
//                   </svg>
//                   {/* Sparkle dots */}
//                   <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
//                   <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-amber-300 rounded-full animate-ping delay-300"></div>
//                 </div>

//                 {/* Title with golden gradient */}
//                 <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent group-hover:from-yellow-200 group-hover:to-amber-200 transition-all duration-300">
//                   TITLE_EXTRACTOR
//                 </h3>

//                 <p className="text-gray-300 text-sm leading-relaxed mb-6 group-hover:text-gray-200 transition-colors">
//                   Advanced AI-powered title and URL extraction from search
//                   result screenshots. Automatically detects and structures
//                   titles with their corresponding URLs.
//                 </p>

//                 {/* Feature list with golden accents */}
//                 <div className="space-y-2 text-xs">
//                   <div className="text-amber-500 group-hover:text-amber-400 transition-colors">
//                     • SMART_TITLE_DETECTION
//                   </div>
//                   <div className="text-yellow-600 group-hover:text-yellow-500 transition-colors">
//                     • URL_EXTRACTION
//                   </div>
//                   <div className="text-amber-500 group-hover:text-amber-400 transition-colors">
//                     • SEARCH_RESULT_PARSING
//                   </div>
//                   <div className="text-yellow-600 group-hover:text-yellow-500 transition-colors">
//                     • STRUCTURED_OUTPUT
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Animated golden status dot */}
//             <div
//               className={`absolute top-4 right-4 w-3 h-3 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full animate-pulse ${
//                 hoveredButton === "title"
//                   ? "opacity-100 scale-125"
//                   : "opacity-60"
//               } transition-all duration-300`}
//             ></div>

//             {/* Subtle shine effect on hover */}
//             <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -skew-x-12 group-hover:skew-x-0 transform transition-transform duration-500"></div>
//           </div>

//           {/* Red Box OCR Card */}
//           <div
//             className={`relative group cursor-pointer transition-all duration-500 ${
//               hoveredButton === "redbox" ? "scale-105" : "scale-100"
//             }`}
//             onMouseEnter={() => setHoveredButton("redbox")}
//             onMouseLeave={() => setHoveredButton(null)}
//             onClick={() => navigateTo("/redbox")}
//           >
//             <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-red-500 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-300"></div>
//             <div className="relative bg-gray-800 rounded-xl p-8 border border-red-500/30 hover:border-red-400/50 transition-all duration-300 h-full">
//               <div className="text-center">
//                 <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-red-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
//                   <svg
//                     className="w-8 h-8 text-white"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
//                     />
//                   </svg>
//                 </div>
//                 <h3 className="text-2xl font-bold text-red-300 mb-3 group-hover:text-red-200 transition-colors">
//                   RED_BOX_DETECTOR
//                 </h3>
//                 <p className="text-gray-400 text-sm leading-relaxed mb-6">
//                   Advanced computer vision system that detects red bounding
//                   boxes and extracts text within them using OpenCV and Tesseract
//                   OCR.
//                 </p>
//                 <div className="space-y-2 text-xs text-red-600">
//                   <div>• OPENCV_INTEGRATION</div>
//                   <div>• RED_BOX_DETECTION</div>
//                   <div>• COMPUTER_VISION</div>
//                   <div>• PRECISE_TEXT_EXTRACTION</div>
//                 </div>
//               </div>
//             </div>
//             <div
//               className={`absolute top-4 right-4 w-3 h-3 bg-red-400 rounded-full animate-pulse ${
//                 hoveredButton === "redbox" ? "opacity-100" : "opacity-50"
//               }`}
//             ></div>
//           </div>
//         </div>

//         {/* Quick Action Buttons */}
//         <div className="flex flex-col sm:flex-row gap-4 mb-8">
//           <button
//             onClick={() => navigateTo("/text-extractor")}
//             className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-lg font-medium text-white hover:from-cyan-500 hover:to-purple-500 transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/40 flex items-center justify-center space-x-3"
//           >
//             <svg
//               className="w-5 h-5"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
//               />
//             </svg>
//             <span>LAUNCH_FULL_PAGE_OCR</span>
//           </button>

//           {/* New Golden Button for Title Extractor */}
//           <button
//             onClick={() => navigateTo("/title-extractor")}
//             className="px-8 py-4 bg-gradient-to-r from-amber-600 to-yellow-600 rounded-lg font-medium text-gray-900 hover:from-amber-500 hover:to-yellow-500 transition-all duration-300 shadow-lg shadow-amber-500/30 hover:shadow-yellow-400/40 flex items-center justify-center space-x-3 font-bold"
//           >
//             <svg
//               className="w-5 h-5"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
//               />
//             </svg>
//             <span>LAUNCH_TITLE_EXTRACTOR</span>
//           </button>

//           <button
//             onClick={() => navigateTo("/redbox")}
//             className="px-8 py-4 bg-gradient-to-r from-purple-600 to-red-600 rounded-lg font-medium text-white hover:from-purple-500 hover:to-red-500 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-red-400/40 flex items-center justify-center space-x-3"
//           >
//             <svg
//               className="w-5 h-5"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
//               />
//             </svg>
//             <span>LAUNCH_RED_BOX_DETECTOR</span>
//           </button>
//         </div>

//         {/* System Status */}
//         <div className="text-center text-gray-500 text-sm font-mono">
//           <div className="flex items-center justify-center space-x-4">
//             <div className="flex items-center space-x-2">
//               <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
//               <span>SYSTEM_OPERATIONAL</span>
//             </div>
//             <div className="flex items-center space-x-2">
//               <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
//               <span>OCR_ENGINES_READY</span>
//             </div>
//             <div className="flex items-center space-x-2">
//               <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
//               <span>TITLE_EXTRACTOR_ACTIVE</span>
//             </div>
//             <div className="flex items-center space-x-2">
//               <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
//               <span>VISION_SYSTEMS_ACTIVE</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Global Styles */}
//       <style jsx global>{`
//         @keyframes pulse-slow {
//           0%,
//           100% {
//             opacity: 0.5;
//           }
//           50% {
//             opacity: 1;
//           }
//         }
//         .animate-pulse-slow {
//           animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
//         }
//         .bg-grid-pattern {
//           background-image: linear-gradient(
//               rgba(6, 182, 212, 0.1) 1px,
//               transparent 1px
//             ),
//             linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px);
//           background-size: 50px 50px;
//         }
//       `}</style>
//     </main>
//   );
// }

// export default function HomePage() {
//   return (
//     <BasicAuth>
//       <HomePageContent />
//     </BasicAuth>
//   );
// }

// components/HomePage.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import BasicAuth from "../components/BasicAuth";

function HomePageContent() {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const features = [
    {
      id: "fullpage",
      title: "Full Page OCR",
      description:
        "Extract text from entire images with high accuracy. Perfect for documents, screenshots, and multi-page processing.",
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
      color: "blue",
      gradient: "from-blue-500 to-cyan-500",
      features: [
        "Multi-file upload",
        "Drag & drop",
        "Batch processing",
        "Real-time preview",
      ],
      stats: "90%-95% accuracy",
    },
    {
      id: "title",
      title: "Title & Link Extractor",
      description:
        "AI-powered extraction of titles and URLs from search results. Perfect for research and content curation.",
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
      color: "purple",
      gradient: "from-purple-500 to-pink-500",
      features: [
        "Smart detection",
        "URL extraction",
        "Structured data",
        "Export ready",
      ],
      stats: "AI-powered",
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
      color: "red",
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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Animated Grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100 to-transparent animate-pulse"></div>
      </div>

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                className="group cursor-pointer"
                onMouseEnter={() => setHoveredCard(feature.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div
                  className={`relative bg-white rounded-3xl shadow-xl border border-white/50 backdrop-blur-sm overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-105 ${
                    hoveredCard === feature.id ? "ring-4 ring-opacity-50" : ""
                  } ring-${feature.color}-500`}
                >
                  {/* Gradient Header */}
                  <div
                    className={`bg-gradient-to-r ${feature.gradient} p-8 relative overflow-hidden`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

                    <div className="relative z-10">
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
                        <div className="text-white">{feature.icon}</div>
                      </div>

                      <h3 className="text-2xl font-bold text-white mb-2">
                        {feature.title}
                      </h3>
                      <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                        <span className="text-white/90 text-sm font-medium">
                          {feature.stats}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    <p className="text-slate-600 mb-6 leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Features List */}
                    <div className="space-y-3 mb-8">
                      {feature.features.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center space-x-3 group/item"
                        >
                          <div
                            className={`w-2 h-2 bg-gradient-to-r ${feature.gradient} rounded-full transition-transform duration-300 group-hover/item:scale-150`}
                          ></div>
                          <span className="text-slate-700 font-medium text-sm">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => navigateTo(feature.path)}
                      className={`w-full bg-gradient-to-r ${feature.gradient} hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center space-x-3 group/btn`}
                    >
                      <span>Get Started</span>
                      <svg
                        className="w-5 h-5 transform group-hover/btn:translate-x-1 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                </div>
              </div>
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
                  <button
                    onClick={() => navigateTo("/text-extractor")}
                    className="bg-white text-blue-600 hover:bg-blue-50 font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    Start with Full Page OCR
                  </button>
                  <button
                    onClick={() => navigateTo("/title-extractor")}
                    className="border-2 border-white text-white hover:bg-white/10 font-semibold py-4 px-8 rounded-2xl transition-all duration-300 backdrop-blur-sm"
                  >
                    Try Title Extractor
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

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </main>
  );
}

export default function HomePage() {
  return (
    <BasicAuth>
      <HomePageContent />
    </BasicAuth>
  );
}
