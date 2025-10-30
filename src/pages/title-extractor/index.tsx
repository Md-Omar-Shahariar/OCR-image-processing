// import { useRouter } from "next/navigation";
// import { useState, useRef, useEffect } from "react";
// import { withAuth } from "../../components/withAuth";

// // interface FileResult {
// //   name: string;
// //   text: string;
// //   status: "success" | "error";
// // }
// interface SearchResult {
//   title: string;
//   url: string;
//   description?: string;
// }

// interface FileResult {
//   name: string;
//   text: string;
//   searchResults: SearchResult[];
//   resultCount: number;
//   status: "success" | "error";
// }
// function TitleExtractor() {
//   const router = useRouter();
//   const [files, setFiles] = useState<File[]>([]);
//   const [results, setResults] = useState<FileResult[]>([]);
//   const [processing, setProcessing] = useState(false);
//   const [isDragging, setIsDragging] = useState(false);
//   const [showSuccess, setShowSuccess] = useState(false);
//   const [showError, setShowError] = useState(false);
//   const [scanLinePosition, setScanLinePosition] = useState(0);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   // Animated scan line effect
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setScanLinePosition((prev) => (prev + 10) % 100);
//     }, 100);
//     return () => clearInterval(interval);
//   }, []);

//   const goHome = () => {
//     router.push("/");
//   };

//   // const handleUpload = async (e: React.FormEvent) => {
//   //   e.preventDefault();
//   //   if (files.length === 0) return;

//   //   setResults([]);
//   //   setProcessing(true);

//   //   let hasError = false;

//   //   for (const file of files) {
//   //     const formData = new FormData();
//   //     formData.append("file", file);
//   //     formData.append("language", "jpn");

//   //     try {
//   //       const res = await fetch("/api/process-image", {
//   //         method: "POST",
//   //         body: formData,
//   //       });
//   //       const data = await res.json();

//   //       setResults((prev) => [
//   //         ...prev,
//   //         {
//   //           name: file.name,
//   //           text: data.status === "success" ? data.text : data.message,
//   //           status: data.status === "success" ? "success" : "error",
//   //         },
//   //       ]);

//   //       if (data.status === "error") {
//   //         hasError = true;
//   //       }
//   //     } catch (err) {
//   //       setResults((prev) => [
//   //         ...prev,
//   //         { name: file.name, text: "Error uploading file", status: "error" },
//   //       ]);
//   //       hasError = true;
//   //     }
//   //   }

//   //   // All files processed
//   //   setProcessing(false);
//   //   setFiles([]);

//   //   // Show success or error popup for 2 seconds
//   //   if (hasError) {
//   //     setShowError(true);
//   //     setTimeout(() => setShowError(false), 2000);
//   //   } else {
//   //     setShowSuccess(true);
//   //     setTimeout(() => setShowSuccess(false), 2000);
//   //   }
//   // };
//   const handleUpload = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (files.length === 0) return;

//     setResults([]);
//     setProcessing(true);

//     let hasError = false;

//     for (const file of files) {
//       const formData = new FormData();
//       formData.append("file", file);
//       formData.append("language", "jpn");

//       try {
//         const res = await fetch("/api/process-image-title", {
//           method: "POST",
//           body: formData,
//         });
//         const data = await res.json();

//         setResults((prev) => [
//           ...prev,
//           {
//             name: file.name,
//             text: data.status === "success" ? data.text : data.message,
//             searchResults: data.searchResults || [],
//             resultCount: data.resultCount || 0,
//             status: data.status === "success" ? "success" : "error",
//           },
//         ]);

//         if (data.status === "error") {
//           hasError = true;
//         }
//       } catch (err) {
//         setResults((prev) => [
//           ...prev,
//           {
//             name: file.name,
//             text: "Error uploading file",
//             searchResults: [],
//             resultCount: 0,
//             status: "error",
//           },
//         ]);
//         hasError = true;
//       }
//     }

//     setProcessing(false);
//     setFiles([]);

//     if (hasError) {
//       setShowError(true);
//       setTimeout(() => setShowError(false), 2000);
//     } else {
//       setShowSuccess(true);
//       setTimeout(() => setShowSuccess(false), 2000);
//     }
//   };
//   const handleDragOver = (e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(true);
//   };

//   const handleDragLeave = () => setIsDragging(false);

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(false);
//     const droppedFiles = Array.from(e.dataTransfer.files);
//     const imageFiles = droppedFiles.filter((file) =>
//       file.type.startsWith("image/")
//     );
//     if (imageFiles.length > 0) setFiles(imageFiles);
//   };

//   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const selectedFiles = Array.from(e.target.files || []);
//     setFiles(selectedFiles);
//   };

//   const removeFile = (index: number) => {
//     const newFiles = [...files];
//     newFiles.splice(index, 1);
//     setFiles(newFiles);
//   };

//   const triggerFileInput = () => {
//     fileInputRef.current?.click();
//   };

//   return (
//     <main className="min-h-screen bg-black text-cyan-300 p-6 font-mono relative overflow-hidden">
//       {/* Cyberpunk Background Elements */}
//       <div className="fixed inset-0 bg-gradient-to-br from-black via-purple-900 to-blue-900 z-0"></div>
//       <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,rgba(120,119,198,0.3),rgba(255,255,255,0))] z-0"></div>

//       {/* Animated Grid */}
//       <div className="fixed inset-0 bg-grid-pattern opacity-20 z-0"></div>

//       {/* Moving Scan Lines */}
//       <div
//         className="fixed inset-0 z-0 opacity-10"
//         style={{
//           background: `linear-gradient(to bottom, transparent 0%, rgba(0, 255, 255, 0.8) ${scanLinePosition}%, transparent 100%)`,
//           backgroundSize: "100% 200px",
//         }}
//       ></div>

//       {/* Neon Orbs */}
//       <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse-slow z-0"></div>
//       <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse-slow delay-1000 z-0"></div>
//       <div className="fixed top-1/2 left-1/2 w-64 h-64 bg-purple-500/15 rounded-full blur-2xl animate-pulse-slow delay-500 z-0"></div>

//       {/* Binary Rain Effect */}
//       <div className="fixed inset-0 bg-binary-rain opacity-30 z-0"></div>

//       {/* Home Button */}
//       <button
//         onClick={goHome}
//         className="fixed top-6 left-6 z-50 bg-black/80 backdrop-blur-md text-cyan-300 px-6 py-3 rounded-lg border border-cyan-500/50 hover:border-cyan-300 transition-all duration-300 neon-glow hover:neon-glow-intense group"
//       >
//         <div className="flex items-center space-x-3">
//           <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
//           <span className="font-mono text-sm tracking-wider">Home</span>
//           <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse delay-1000"></div>
//         </div>
//       </button>

//       <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
//         {/* Cyberpunk Title */}
//         <div className="text-center mb-12 relative">
//           {/* Title Glow Effect */}
//           <div className="absolute -inset-8 bg-cyan-500/20 blur-2xl rounded-full animate-pulse"></div>

//           {/* Main Title */}
//           <h1 className="text-5xl md:text-6xl font-bold relative bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-pink-400 to-purple-400 tracking-widest neon-text">
//             <span className="text-cyan-300 drop-shadow-neon">[</span>
//             OCR_IMAGE_PROCESSOR_V2
//             <span className="text-cyan-300 drop-shadow-neon">]</span>
//           </h1>

//           {/* Subtitle */}
//           <div className="h-1 w-80 mx-auto mt-6 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-lg shadow-cyan-400/50"></div>
//           <p className="text-cyan-600 mt-3 text-sm font-mono tracking-wider glow-text">
//             BATCH_FILE_PROCESSING_SYSTEM
//           </p>
//         </div>

//         {/* Main Cyberpunk Terminal */}
//         <div className="w-full max-w-4xl bg-black/60 backdrop-blur-md rounded-xl border border-cyan-500/40 shadow-2xl shadow-cyan-500/30 p-8 mb-8 relative overflow-hidden neon-terminal">
//           {/* Terminal Header */}
//           <div className="flex items-center mb-8 pb-4 border-b border-cyan-500/40 relative">
//             {/* Animated Header Glow */}
//             <div className="absolute -inset-4 bg-cyan-500/10 blur-xl rounded-lg"></div>

//             <div className="flex space-x-3 relative z-10">
//               <div className="w-3 h-3 bg-red-400 rounded-full neon-dot"></div>
//               <div className="w-3 h-3 bg-yellow-400 rounded-full neon-dot delay-300"></div>
//               <div className="w-3 h-3 bg-green-400 rounded-full neon-dot delay-700"></div>
//             </div>

//             <div className="flex-1 text-center">
//               <span className="text-cyan-300 font-mono text-lg tracking-wider glow-text">
//                 MULTI_FILE_OCR_PROCESSOR
//               </span>
//             </div>

//             <div className="text-cyan-600 text-xs font-mono tracking-wider">
//               SYSTEM_v2.3.7
//             </div>
//           </div>

//           {/* Upload Section */}
//           <div className="mb-8">
//             <label className="block text-cyan-300 font-mono text-sm mb-4 tracking-wider glow-text">
//               UPLOAD_TARGET_FILES:
//             </label>

//             {/* Drop Zone */}
//             <div
//               className={`relative block cursor-pointer group mb-6 ${
//                 isDragging ? "neon-glow-intense" : ""
//               }`}
//             >
//               {/* Upload Card Glow */}
//               <div className="absolute -inset-2 bg-cyan-500/20 blur-lg rounded-2xl group-hover:bg-cyan-400/30 transition-all duration-500"></div>

//               <div
//                 className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 neon-upload ${
//                   isDragging
//                     ? "border-cyan-400 bg-cyan-900/20"
//                     : "border-cyan-700 hover:border-cyan-500"
//                 }`}
//                 onDragOver={handleDragOver}
//                 onDragLeave={handleDragLeave}
//                 onDrop={handleDrop}
//                 onClick={triggerFileInput}
//               >
//                 <input
//                   type="file"
//                   accept="image/*"
//                   multiple
//                   onChange={handleFileSelect}
//                   ref={fileInputRef}
//                   className="hidden"
//                 />
//                 <div className="relative z-10">
//                   {/* Upload Icon */}
//                   <div className="w-16 h-16 mx-auto mb-4 relative">
//                     <div className="absolute inset-0 bg-cyan-400/20 rounded-full animate-ping"></div>
//                     <div className="absolute inset-2 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center neon-icon">
//                       <svg
//                         className="w-8 h-8 text-black"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
//                         />
//                       </svg>
//                     </div>
//                   </div>

//                   <div className="text-cyan-300 font-mono text-xl mb-2 tracking-wider">
//                     {files.length > 0
//                       ? `${files.length}_FILES_SELECTED`
//                       : processing
//                       ? "PROCESSING..."
//                       : "DROP_ZONE_ACTIVE"}
//                   </div>
//                   <div className="text-cyan-600 text-sm font-mono tracking-wider">
//                     SUPPORTED_FORMATS: JPG/PNG/BMP
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* File List */}
//             {files.length > 0 && (
//               <div className="w-full space-y-3 max-h-40 overflow-y-auto mt-4 terminal-scroll">
//                 {files.map((file, index) => (
//                   <div
//                     key={index}
//                     className="flex items-center justify-between bg-gradient-to-r from-cyan-500/10 to-purple-500/5 rounded-xl p-1 border border-cyan-500/20 neon-result"
//                   >
//                     <div className="bg-black/80 rounded-xl p-3 flex-1">
//                       <div className="flex items-center justify-between">
//                         <span className="text-cyan-300 text-sm font-mono tracking-wider truncate max-w-xs">
//                           {file.name}
//                         </span>
//                         <button
//                           type="button"
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             removeFile(index);
//                           }}
//                           className="text-cyan-700 hover:text-cyan-400 transition-colors font-mono text-lg px-2"
//                         >
//                           ✕
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* Upload Button */}
//             <button
//               type="submit"
//               disabled={processing || files.length === 0}
//               onClick={handleUpload}
//               className={`w-full py-4 px-6 rounded-lg font-mono text-lg tracking-wider transition-all duration-300 flex items-center justify-center mt-6 ${
//                 processing || files.length === 0
//                   ? "bg-cyan-900/30 cursor-not-allowed text-cyan-700 border border-cyan-700/30"
//                   : "bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/40 text-gray-900 font-bold"
//               } neon-glow`}
//             >
//               {processing ? (
//                 <div className="flex items-center space-x-3">
//                   <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
//                   <span>PROCESSING_FILES...</span>
//                   <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-300"></div>
//                 </div>
//               ) : (
//                 "UPLOAD_&_EXTRACT_TEXT"
//               )}
//             </button>
//           </div>

//           {/* Result Section */}
//           {/* {results.length > 0 && (
//             <section className="w-full bg-black/60 backdrop-blur-md rounded-xl border border-purple-500/40 shadow-2xl shadow-purple-500/30 p-6 mt-8 neon-panel">
//               <div className="flex items-center justify-between pb-4 border-b border-purple-500/40 mb-6">
//                 <div className="flex items-center">
//                   <div className="w-2 h-2 bg-pink-400 rounded-full mr-3 animate-pulse neon-dot"></div>
//                   <h2 className="text-cyan-300 font-mono text-2xl tracking-wider glow-text">
//                     OCR_RESULTS
//                   </h2>
//                 </div>
//                 <span className="text-pink-500 text-sm font-mono tracking-wider neon-badge">
//                   {results.length}_FILES_PROCESSED
//                 </span>
//               </div>

//               <div className="space-y-4 max-h-96 overflow-y-auto terminal-scroll pr-2">
//                 {results.map((r, idx) => (
//                   <div
//                     key={idx}
//                     className={`bg-gradient-to-r rounded-xl p-1 border-l-4 neon-result ${
//                       r.status === "error"
//                         ? "from-red-500/10 to-pink-500/5 border-red-500"
//                         : "from-cyan-500/10 to-purple-500/5 border-cyan-500"
//                     }`}
//                   >
//                     <div className="bg-black/80 rounded-xl p-5">
//                       <div className="flex items-center justify-between mb-3">
//                         <h3
//                           className={`font-mono text-lg font-bold tracking-wider ${
//                             r.status === "error"
//                               ? "text-red-400"
//                               : "text-cyan-300"
//                           }`}
//                         >
//                           {r.name}
//                         </h3>
//                         <span
//                           className={`text-xs font-mono tracking-wider px-2 py-1 rounded ${
//                             r.status === "error"
//                               ? "bg-red-500/20 text-red-400"
//                               : "bg-cyan-500/20 text-cyan-400"
//                           }`}
//                         >
//                           {r.status === "error" ? "ERROR" : "SUCCESS"}
//                         </span>
//                       </div>
//                       <div
//                         className={`p-4 rounded-md border ${
//                           r.status === "error"
//                             ? "bg-red-900/20 border-red-500/30"
//                             : "bg-cyan-900/20 border-cyan-500/30"
//                         }`}
//                       >
//                         <pre className="whitespace-pre-wrap break-words text-cyan-200 font-mono text-sm tracking-wide neon-text-content">
//                           {r.text}
//                         </pre>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </section>
//           )} */}

//           {results.length > 0 && (
//             <section className="w-full bg-black/60 backdrop-blur-md rounded-xl border border-purple-500/40 shadow-2xl shadow-purple-500/30 p-6 mt-8 neon-panel">
//               <div className="flex items-center justify-between pb-4 border-b border-purple-500/40 mb-6">
//                 <div className="flex items-center">
//                   <div className="w-2 h-2 bg-pink-400 rounded-full mr-3 animate-pulse neon-dot"></div>
//                   <h2 className="text-cyan-300 font-mono text-2xl tracking-wider glow-text">
//                     EXTRACTION_RESULTS
//                   </h2>
//                 </div>
//                 <span className="text-pink-500 text-sm font-mono tracking-wider neon-badge">
//                   {results.reduce((acc, r) => acc + r.resultCount, 0)}
//                   _ITEMS_FOUND
//                 </span>
//               </div>

//               <div className="space-y-6 max-h-96 overflow-y-auto terminal-scroll pr-2">
//                 {results.map((r, idx) => (
//                   <div
//                     key={idx}
//                     className={`bg-gradient-to-r rounded-xl p-1 border-l-4 neon-result ${
//                       r.status === "error"
//                         ? "from-red-500/10 to-pink-500/5 border-red-500"
//                         : "from-cyan-500/10 to-purple-500/5 border-cyan-500"
//                     }`}
//                   >
//                     <div className="bg-black/80 rounded-xl p-5">
//                       <div className="flex items-center justify-between mb-3">
//                         <h3
//                           className={`font-mono text-lg font-bold tracking-wider ${
//                             r.status === "error"
//                               ? "text-red-400"
//                               : "text-cyan-300"
//                           }`}
//                         >
//                           {r.name}
//                         </h3>
//                         <div className="flex items-center space-x-3">
//                           <span
//                             className={`text-xs font-mono tracking-wider px-2 py-1 rounded ${
//                               r.status === "error"
//                                 ? "bg-red-500/20 text-red-400"
//                                 : r.resultCount > 0
//                                 ? "bg-green-500/20 text-green-400"
//                                 : "bg-yellow-500/20 text-yellow-400"
//                             }`}
//                           >
//                             {r.status === "error"
//                               ? "ERROR"
//                               : r.resultCount > 0
//                               ? `${r.resultCount} LINKS`
//                               : "NO LINKS"}
//                           </span>
//                         </div>
//                       </div>

//                       {/* Structured Search Results */}
//                       {r.searchResults.length > 0 ? (
//                         <div className="space-y-3">
//                           <div className="text-cyan-400 text-sm font-mono mb-2">
//                             EXTRACTED_LINKS:
//                           </div>
//                           {r.searchResults.map((result, resultIdx) => (
//                             <div
//                               key={resultIdx}
//                               className="bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-lg p-4 border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300"
//                             >
//                               <div className="mb-3">
//                                 <div className="text-cyan-400 text-xs font-mono tracking-wider mb-1">
//                                   TITLE_{resultIdx + 1}:
//                                 </div>
//                                 <div className="text-cyan-200 font-mono text-sm bg-black/30 p-2 rounded">
//                                   {result.title}
//                                 </div>
//                               </div>
//                               <div>
//                                 <div className="text-cyan-400 text-xs font-mono tracking-wider mb-1">
//                                   URL_{resultIdx + 1}:
//                                 </div>
//                                 <div className="text-cyan-300 font-mono text-sm break-all bg-black/30 p-2 rounded">
//                                   <a
//                                     href={result.url}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     className="hover:text-cyan-100 hover:underline transition-colors"
//                                   >
//                                     {result.url}
//                                   </a>
//                                 </div>
//                               </div>
//                               <div className="mb-3">
//                                 <div className="text-cyan-400 text-xs font-mono tracking-wider mb-1">
//                                   Description_{resultIdx + 1}:
//                                 </div>
//                                 <div className="text-cyan-200 font-mono text-sm bg-black/30 p-2 rounded">
//                                   {result.description}
//                                 </div>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       ) : r.status === "success" ? (
//                         <div className="space-y-4">
//                           <div className="text-center py-2 text-yellow-400 font-mono text-sm">
//                             NO_STRUCTURED_LINKS_DETECTED
//                           </div>
//                           <div className="p-4 bg-cyan-900/20 rounded border border-cyan-500/30">
//                             <div className="text-cyan-400 text-xs font-mono mb-3 flex items-center justify-between">
//                               <span>RAW_OCR_TEXT:</span>
//                               <span className="text-cyan-600">
//                                 {r.text.length} chars
//                               </span>
//                             </div>
//                             <pre className="text-cyan-200 text-sm whitespace-pre-wrap max-h-40 overflow-y-auto font-mono">
//                               {r.text}
//                             </pre>
//                           </div>
//                         </div>
//                       ) : (
//                         <div className="p-4 bg-red-900/20 rounded border border-red-500/30">
//                           <pre className="text-red-200 font-mono text-sm">
//                             {r.text}
//                           </pre>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </section>
//           )}
//           {/* Empty State */}
//           {!processing && results.length === 0 && files.length === 0 && (
//             <div className="text-center py-12 text-cyan-600 font-mono tracking-wider text-lg neon-empty">
//               SELECT_FILES_TO_INITIATE_BATCH_PROCESSING
//             </div>
//           )}
//         </div>

//         {/* System Footer */}
//         <div className="text-center text-cyan-600 text-sm font-mono tracking-wider mt-8">
//           <div className="space-y-1">
//             <div>BATCH_PROCESSING_SYSTEM v2.3.7 | CYBERSCAN_ACTIVE</div>
//             <div>MODE: MULTI_FILE_OCR_PROCESSOR</div>
//           </div>
//         </div>
//       </div>

//       {/* Success Popup */}
//       {showSuccess && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
//           <div className="relative w-64 h-64">
//             {/* Outer Glow Ring */}
//             <div className="absolute inset-0 rounded-full bg-cyan-500/30 animate-ping-slow"></div>

//             {/* Cyberpunk Hexagon */}
//             <svg
//               className="absolute inset-0 w-full h-full text-cyan-400 animate-pulse"
//               viewBox="0 0 100 100"
//             >
//               <polygon
//                 points="50,5 85,25 85,75 50,95 15,75 15,25"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeDasharray="5,3"
//               />
//             </svg>

//             {/* Inner Hexagon with Neon Glow */}
//             <svg
//               className="absolute inset-0 m-auto w-40 h-40 text-cyan-500"
//               viewBox="0 0 100 100"
//             >
//               <polygon
//                 points="50,15 75,30 75,70 50,85 25,70 25,30"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="1.5"
//                 style={{
//                   filter: "drop-shadow(0 0 10px rgba(0, 255, 255, 0.8))",
//                 }}
//               />
//             </svg>

//             {/* Animated Blue Tick */}
//             <svg
//               className="absolute inset-0 m-auto w-24 h-24 text-cyan-400"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="4"
//               viewBox="0 0 24 24"
//               style={{ filter: "drop-shadow(0 0 15px rgba(0, 255, 255, 1))" }}
//             >
//               <path
//                 d="M5 13l4 4L19 7"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               />
//             </svg>

//             {/* Enhanced Glowing Particles */}
//             {[...Array(8)].map((_, i) => (
//               <div
//                 key={i}
//                 className="absolute w-3 h-3 bg-cyan-400 rounded-full animate-float"
//                 style={{
//                   top: `${50 + 40 * Math.sin((i * Math.PI) / 4)}%`,
//                   left: `${50 + 40 * Math.cos((i * Math.PI) / 4)}%`,
//                   animationDelay: `${i * 0.15}s`,
//                   filter: "drop-shadow(0 0 8px rgba(0, 255, 255, 0.9))",
//                 }}
//               ></div>
//             ))}

//             {/* Success Text */}
//             <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-cyan-400 font-mono tracking-wider text-lg glow-text whitespace-nowrap">
//               PROCESSING_COMPLETE
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Error Popup */}
//       {showError && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
//           <div className="relative w-64 h-64">
//             {/* Outer Glow Ring */}
//             <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping-slow"></div>

//             {/* Cyberpunk Hexagon */}
//             <svg
//               className="absolute inset-0 w-full h-full text-red-400 animate-pulse"
//               viewBox="0 0 100 100"
//             >
//               <polygon
//                 points="50,5 85,25 85,75 50,95 15,75 15,25"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeDasharray="5,3"
//               />
//             </svg>

//             {/* Inner Hexagon with Neon Glow */}
//             <svg
//               className="absolute inset-0 m-auto w-40 h-40 text-red-500"
//               viewBox="0 0 100 100"
//             >
//               <polygon
//                 points="50,15 75,30 75,70 50,85 25,70 25,30"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="1.5"
//                 style={{
//                   filter: "drop-shadow(0 0 10px rgba(255, 0, 0, 0.8))",
//                 }}
//               />
//             </svg>

//             {/* Animated Red X Mark */}
//             <svg
//               className="absolute inset-0 m-auto w-24 h-24 text-red-400"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="4"
//               viewBox="0 0 24 24"
//               style={{ filter: "drop-shadow(0 0 15px rgba(255, 0, 0, 1))" }}
//             >
//               <path
//                 d="M6 18L18 6M6 6l12 12"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               />
//             </svg>

//             {/* Enhanced Glowing Particles */}
//             {[...Array(8)].map((_, i) => (
//               <div
//                 key={i}
//                 className="absolute w-3 h-3 bg-red-400 rounded-full animate-float"
//                 style={{
//                   top: `${50 + 40 * Math.sin((i * Math.PI) / 4)}%`,
//                   left: `${50 + 40 * Math.cos((i * Math.PI) / 4)}%`,
//                   animationDelay: `${i * 0.15}s`,
//                   filter: "drop-shadow(0 0 8px rgba(255, 0, 0, 0.9))",
//                 }}
//               ></div>
//             ))}

//             {/* Error Text */}
//             <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-red-400 font-mono tracking-wider text-lg glow-text-red whitespace-nowrap">
//               PROCESSING_ERROR
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Global Cyberpunk Styles */}
//       <style jsx global>{`
//         .bg-grid-pattern {
//           background-image: linear-gradient(
//               rgba(0, 255, 255, 0.1) 1px,
//               transparent 1px
//             ),
//             linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
//           background-size: 50px 50px;
//         }

//         .bg-binary-rain {
//           background: linear-gradient(
//             transparent 90%,
//             rgba(0, 255, 255, 0.1) 100%
//           );
//           background-size: 100% 10px;
//           animation: binaryRain 1s linear infinite;
//         }

//         @keyframes binaryRain {
//           0% {
//             background-position: 0 0;
//           }
//           100% {
//             background-position: 0 10px;
//           }
//         }

//         .neon-text {
//           text-shadow: 0 0 5px currentColor, 0 0 10px currentColor,
//             0 0 15px currentColor, 0 0 20px currentColor;
//         }

//         .glow-text {
//           text-shadow: 0 0 10px rgba(0, 255, 255, 0.7);
//         }

//         .neon-glow {
//           box-shadow: 0 0 5px rgba(0, 255, 255, 0.5),
//             0 0 10px rgba(0, 255, 255, 0.3),
//             inset 0 0 10px rgba(0, 255, 255, 0.1);
//         }

//         .neon-glow-intense {
//           box-shadow: 0 0 15px rgba(0, 255, 255, 0.8),
//             0 0 30px rgba(0, 255, 255, 0.5),
//             inset 0 0 20px rgba(0, 255, 255, 0.2);
//         }

//         .neon-terminal {
//           box-shadow: 0 0 30px rgba(0, 255, 255, 0.3),
//             0 0 60px rgba(0, 255, 255, 0.1),
//             inset 0 0 30px rgba(0, 255, 255, 0.05);
//         }

//         .neon-upload {
//           box-shadow: 0 0 20px rgba(0, 255, 255, 0.2),
//             inset 0 0 20px rgba(0, 255, 255, 0.1);
//         }

//         .neon-panel {
//           box-shadow: 0 0 20px rgba(0, 255, 255, 0.15),
//             inset 0 0 20px rgba(0, 255, 255, 0.05);
//         }

//         .neon-result {
//           box-shadow: 0 0 10px rgba(255, 0, 255, 0.3),
//             0 0 20px rgba(255, 0, 255, 0.1);
//         }

//         .neon-dot {
//           box-shadow: 0 0 10px currentColor;
//         }

//         .neon-icon {
//           box-shadow: 0 0 20px rgba(0, 255, 255, 0.5),
//             0 0 40px rgba(0, 255, 255, 0.3);
//         }

//         .neon-badge {
//           text-shadow: 0 0 5px rgba(255, 0, 255, 0.7);
//         }

//         .neon-text-content {
//           text-shadow: 0 0 3px rgba(0, 255, 255, 0.5);
//         }

//         .neon-empty {
//           text-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
//         }

//         .terminal-scroll::-webkit-scrollbar {
//           width: 8px;
//         }

//         .terminal-scroll::-webkit-scrollbar-track {
//           background: rgba(0, 255, 255, 0.1);
//           border-radius: 4px;
//         }

//         .terminal-scroll::-webkit-scrollbar-thumb {
//           background: rgba(0, 255, 255, 0.3);
//           border-radius: 4px;
//         }

//         .terminal-scroll::-webkit-scrollbar-thumb:hover {
//           background: rgba(0, 255, 255, 0.5);
//         }

//         @keyframes pulse-slow {
//           0%,
//           100% {
//             opacity: 0.3;
//           }
//           50% {
//             opacity: 1;
//           }
//         }

//         @keyframes progress {
//           0% {
//             transform: translateX(-100%);
//           }
//           100% {
//             transform: translateX(100%);
//           }
//         }

//         @keyframes float {
//           0%,
//           100% {
//             transform: translateY(0) scale(1);
//             opacity: 1;
//           }
//           50% {
//             transform: translateY(-20px) scale(1.2);
//             opacity: 0.7;
//           }
//         }

//         .animate-pulse-slow {
//           animation: pulse-slow 3s ease-in-out infinite;
//         }

//         .animate-progress {
//           animation: progress 2s ease-in-out infinite;
//         }

//         .animate-float {
//           animation: float 2s ease-in-out infinite;
//         }

//         .drop-shadow-neon {
//           filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.7));
//         }

//         @keyframes ping-slow {
//           0% {
//             transform: scale(0.8);
//             opacity: 0.8;
//           }
//           50% {
//             transform: scale(1.2);
//             opacity: 0.5;
//           }
//           100% {
//             transform: scale(1.4);
//             opacity: 0;
//           }
//         }

//         .animate-ping-slow {
//           animation: ping-slow 2s ease-out forwards;
//         }
//       `}</style>
//     </main>
//   );
// }

// export default withAuth(TitleExtractor);

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { withAuth } from "../../components/withAuth";

interface SearchResult {
  title: string;
  url: string;
  description?: string;
}

interface FileResult {
  name: string;
  text: string;
  searchResults: SearchResult[];
  resultCount: number;
  status: "success" | "error";
}

function TitleExtractor() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<FileResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulate upload progress
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    if (processing) {
      setUploadProgress(0);
      progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
    } else {
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1000);
    }
    return () => clearInterval(progressInterval);
  }, [processing]);

  const goHome = () => {
    router.push("/");
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;

    setResults([]);
    setProcessing(true);

    let hasError = false;
    let successCount = 0;

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", "jpn");

      try {
        const res = await fetch("/api/process-image-title", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        setResults((prev) => [
          ...prev,
          {
            name: file.name,
            text: data.status === "success" ? data.text : data.message,
            searchResults: data.searchResults || [],
            resultCount: data.resultCount || 0,
            status: data.status === "success" ? "success" : "error",
          },
        ]);

        if (data.status === "success") {
          successCount++;
        } else {
          hasError = true;
        }
      } catch (err) {
        setResults((prev) => [
          ...prev,
          {
            name: file.name,
            text: "Network error occurred while processing file",
            searchResults: [],
            resultCount: 0,
            status: "error",
          },
        ]);
        hasError = true;
      }
    }

    setProcessing(false);
    setFiles([]);

    if (hasError) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } else {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    const imageFiles = droppedFiles.filter((file) =>
      file.type.startsWith("image/")
    );
    if (imageFiles.length > 0) setFiles(imageFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="max-w-6xl mx-auto px-4 pt-8 pb-4">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={goHome}
              className="group flex items-center space-x-3 bg-white/80 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
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
                Back to Home
              </span>
            </button>

            <div className="text-right bg-white/80 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/50 shadow-lg">
              <div className="text-lg font-bold text-slate-800">
                Title & Link Extractor
              </div>
              <div className="text-sm text-slate-600">
                AI-Powered OCR Technology
              </div>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 overflow-hidden mb-8">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>

              <div className="relative z-10">
                <h1 className="text-4xl font-bold text-white mb-4">
                  Extract Titles & Links from Images
                </h1>
                <p className="text-purple-100 text-lg max-w-2xl">
                  Upload screenshots of search results to automatically extract
                  titles, URLs, and descriptions with our advanced AI technology
                </p>
              </div>
            </div>

            {/* Upload Section */}
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Upload Area */}
                <div>
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-3">
                      Upload Your Images
                    </h2>
                    <p className="text-slate-600">
                      Drag and drop your search result screenshots or click to
                      browse. We&apos;ll automatically detect and extract titles
                      with their corresponding URLs.
                    </p>
                  </div>

                  {/* Drop Zone */}
                  <div
                    className={`relative border-3 border-dashed rounded-2xl p-8 text-center transition-all duration-500 cursor-pointer mb-6 group ${
                      isDragging
                        ? "border-purple-500 bg-purple-50 scale-105"
                        : "border-slate-300 hover:border-purple-400 hover:bg-purple-50"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={triggerFileInput}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      ref={fileInputRef}
                      className="hidden"
                    />

                    <div className="max-w-md mx-auto">
                      <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <svg
                          className="w-10 h-10 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>

                      <h3 className="text-xl font-semibold text-slate-800 mb-3">
                        {files.length > 0
                          ? `📁 ${files.length} file${
                              files.length > 1 ? "s" : ""
                            } selected`
                          : processing
                          ? "🔄 Processing your files..."
                          : "✨ Drop images here or click to browse"}
                      </h3>

                      <p className="text-slate-500 text-sm mb-4">
                        Supports JPG, PNG, BMP • Maximum 1MB per file
                      </p>

                      <div className="inline-flex items-center space-x-2 bg-slate-100 rounded-full px-4 py-2">
                        <svg
                          className="w-4 h-4 text-slate-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-slate-600 text-sm">
                          Perfect for search result screenshots
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {processing && (
                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-slate-600 mb-2">
                        <span>Processing files...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Upload Button */}
                  <button
                    type="submit"
                    disabled={processing || files.length === 0}
                    onClick={handleUpload}
                    className={`w-full py-5 px-6 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-3 group/btn ${
                      processing || files.length === 0
                        ? "bg-slate-300 cursor-not-allowed text-slate-500"
                        : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    }`}
                  >
                    {processing ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>
                          Extracting from {files.length} image
                          {files.length > 1 ? "s" : ""}...
                        </span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-6 h-6 group-hover/btn:scale-110 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        <span>Extract Titles & Links</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Right Column - File List & Info */}
                <div>
                  {/* File List */}
                  {files.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                        <span>📄 Selected Files</span>
                        <span className="bg-purple-100 text-purple-600 text-sm px-3 py-1 rounded-full">
                          {files.length}
                        </span>
                      </h3>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-white rounded-xl p-4 border border-slate-200 hover:border-purple-300 transition-all duration-300 hover:shadow-md group/item"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg
                                  className="w-5 h-5 text-purple-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                              </div>
                              <div>
                                <div className="text-slate-800 font-medium text-sm truncate max-w-xs">
                                  {file.name}
                                </div>
                                <div className="text-slate-500 text-xs">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFile(index);
                              }}
                              className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                            >
                              <svg
                                className="w-4 h-4"
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
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tips Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-3 flex items-center space-x-2">
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
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Pro Tips</span>
                    </h4>
                    <ul className="space-y-2 text-sm text-blue-700">
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        <span>Use clear screenshots of search results</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        <span>Ensure text is readable and not blurry</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        <span>Multiple images processed simultaneously</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          {results.length > 0 && (
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                    <span>🎉 Extraction Complete!</span>
                  </h2>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <span className="text-white font-semibold">
                      {results.reduce((acc, r) => acc + r.resultCount, 0)} links
                      found
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  {results.map((result, idx) => (
                    <div
                      key={idx}
                      className={`rounded-2xl p-1 bg-gradient-to-r ${
                        result.status === "error"
                          ? "from-red-500 to-pink-500"
                          : result.resultCount > 0
                          ? "from-green-500 to-emerald-500"
                          : "from-yellow-500 to-amber-500"
                      }`}
                    >
                      <div className="bg-white rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                result.status === "error"
                                  ? "bg-red-100 text-red-600"
                                  : result.resultCount > 0
                                  ? "bg-green-100 text-green-600"
                                  : "bg-yellow-100 text-yellow-600"
                              }`}
                            >
                              {result.status === "error"
                                ? "❌"
                                : result.resultCount > 0
                                ? "✅"
                                : "⚠️"}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-800">
                                {result.name}
                              </h3>
                              <p
                                className={`text-sm font-medium ${
                                  result.status === "error"
                                    ? "text-red-600"
                                    : result.resultCount > 0
                                    ? "text-green-600"
                                    : "text-yellow-600"
                                }`}
                              >
                                {result.status === "error"
                                  ? "Processing failed"
                                  : result.resultCount > 0
                                  ? `${result.resultCount} links extracted`
                                  : "No links detected"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Search Results */}
                        {result.searchResults.length > 0 ? (
                          <div className="space-y-4">
                            <h4 className="font-semibold text-slate-700 text-lg mb-4">
                              📋 Extracted Results
                            </h4>
                            <div className="grid gap-4">
                              {result.searchResults.map((link, linkIdx) => (
                                <div
                                  key={linkIdx}
                                  className="bg-slate-50 rounded-xl p-5 border border-slate-200 hover:border-purple-300 transition-all duration-300 group/link"
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                      <div className="text-sm text-slate-500 font-medium mb-2">
                                        Title
                                      </div>
                                      <div className="text-slate-800 font-semibold text-lg mb-1">
                                        {link.title}
                                      </div>
                                      {link.description && (
                                        <>
                                          <div className="text-sm text-slate-500 font-medium mb-2 mt-3">
                                            Description
                                          </div>
                                          <div className="text-slate-600">
                                            {link.description}
                                          </div>
                                        </>
                                      )}
                                    </div>
                                    <button
                                      onClick={() =>
                                        copyToClipboard(link.title)
                                      }
                                      className="opacity-0 group-hover/link:opacity-100 transition-opacity duration-300 text-slate-400 hover:text-purple-600 p-2"
                                      title="Copy title"
                                    >
                                      <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                        />
                                      </svg>
                                    </button>
                                  </div>
                                  <div>
                                    <div className="text-sm text-slate-500 font-medium mb-2">
                                      🔗 URL
                                    </div>
                                    <a
                                      href={link.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-purple-600 hover:text-purple-700 break-all font-medium inline-flex items-center space-x-2 group/url"
                                    >
                                      <span>{link.url}</span>
                                      <svg
                                        className="w-4 h-4 group-hover/url:translate-x-1 transition-transform"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                        />
                                      </svg>
                                    </a>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : result.status === "success" ? (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                              <svg
                                className="w-8 h-8 text-yellow-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                                />
                              </svg>
                            </div>
                            <h4 className="text-lg font-semibold text-slate-700 mb-2">
                              No structured links detected
                            </h4>
                            <p className="text-slate-600 mb-4">
                              We couldn&apos;t find any titles with URLs in this
                              image.
                            </p>
                            <button
                              onClick={() => copyToClipboard(result.text)}
                              className="inline-flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg transition-colors"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                              <span>Copy extracted text</span>
                            </button>
                          </div>
                        ) : (
                          <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                            <div className="flex items-center space-x-3 text-red-800">
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
                                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <div>
                                <div className="font-semibold">
                                  Processing Error
                                </div>
                                <p className="text-red-700 mt-1">
                                  {result.text}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!processing && results.length === 0 && files.length === 0 && (
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">
                Ready to Extract Titles & Links
              </h3>
              <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto">
                Upload search result screenshots to automatically extract titles
                with their corresponding URLs and descriptions.
              </p>
              <div className="inline-flex items-center space-x-2 bg-slate-100 rounded-full px-4 py-2">
                <span className="text-slate-600">
                  ✨ Perfect for research, content curation, and data extraction
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center py-8">
          <div className="inline-flex flex-wrap justify-center gap-6 bg-white/80 backdrop-blur-md rounded-2xl px-8 py-6 border border-white/50 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <div className="text-sm font-semibold text-slate-800">
                  AI Processing
                </div>
                <div className="text-xs text-slate-500">Active</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
              <div>
                <div className="text-sm font-semibold text-slate-800">
                  Title Extraction
                </div>
                <div className="text-xs text-slate-500">Ready</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <div>
                <div className="text-sm font-semibold text-slate-800">
                  URL Detection
                </div>
                <div className="text-xs text-slate-500">Online</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-4 backdrop-blur-md">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
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
            </div>
            <div>
              <div className="font-bold">🎉 Extraction Complete!</div>
              <div className="text-green-100 text-sm">
                All titles and links have been extracted successfully
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {showError && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-4 backdrop-blur-md">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
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
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <div className="font-bold">⚠️ Partial Completion</div>
              <div className="text-red-100 text-sm">
                Some files couldn&apos;t be processed
              </div>
            </div>
          </div>
        </div>
      )}

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
        @keyframes slide-up {
          0% {
            transform: translateY(100%);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
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
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </main>
  );
}

export default withAuth(TitleExtractor);
