import { useState } from "react";

interface FileResult {
  name: string;
  text: string;
  status: "success" | "error";
}

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<FileResult[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;

    setResults([]);
    setProcessing(true);

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file); // 👈 send ONE file per request
      formData.append("language", "jpn");

      try {
        const res = await fetch("/api/process-image", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        setResults((prev) => [
          ...prev,
          {
            name: file.name,
            text: data.status === "success" ? data.text : data.message,
            status: data.status === "success" ? "success" : "error",
          },
        ]);
      } catch (err) {
        setResults((prev) => [
          ...prev,
          { name: file.name, text: "Error uploading file", status: "error" },
        ]);
      }
    }

    setProcessing(false);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 p-6">
      {/* Title */}
      <h1 className="text-4xl font-extrabold text-gray-800 mb-6 tracking-tight">
        OCR Image Processor
      </h1>

      {/* Upload Form */}
      <form
        onSubmit={handleUpload}
        className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-lg flex flex-col items-center space-y-4"
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer"
        />

        {files.length > 0 && (
          <p className="text-sm text-gray-600">
            ✅ {files.length} file{files.length > 1 ? "s" : ""} selected
          </p>
        )}

        <button
          type="submit"
          disabled={processing}
          className={`bg-blue-600 hover:bg-blue-700 transition text-white font-medium px-6 py-3 rounded-xl w-full text-center shadow-md ${
            processing ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {processing ? "Processing..." : "Upload & Extract Text"}
        </button>
      </form>

      {/* Result Section */}
      {results.length > 0 && (
        <section className="mt-6 w-full max-w-3xl flex flex-col space-y-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            OCR Results:
          </h2>

          {results.map((r, idx) => (
            <div
              key={idx}
              className={`bg-white shadow-md rounded-2xl p-6 border border-gray-200`}
            >
              <h3
                className={`font-semibold text-lg mb-2 ${
                  r.status === "error" ? "text-red-600" : "text-gray-800"
                }`}
              >
                {r.name}
              </h3>
              <pre className="whitespace-pre-wrap text-gray-800">{r.text}</pre>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
