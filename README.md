# OCR Vision Suite

OCR Vision Suite is an internal-friendly toolkit built with Next.js 15 that turns screenshots into structured, copy‑ready data. It includes three specialized workflows:

- **Full Page OCR** – batch extract text from documents, PDFs, or multi-screen captures with live previews.
- **Title & Link Extractor** – pull titles, URLs, and snippets from search result screenshots for research or content curation.
- **Google Vision Extractor** – use Google Cloud Vision for multilingual SERP screenshots when OCR.Space struggles to detect titles, URLs, and snippets.
- **Red Box Scanner** – detect red-highlighted regions via OpenCV and read the enclosed text with Tesseract.js.

All tools share a cohesive, responsive UI, built-in drag-and-drop uploads, toasts, and guided states to make repeated OCR tasks fast and pleasant.

## Prerequisites

- Node.js 18+
- npm (bundled with Node) or another supported package manager (yarn, pnpm, bun)

## Local Development

```bash
# Install dependencies
npm install

# Start the Next.js app with TurboPack
npm run dev
```

Visit <http://localhost:3000>. The dashboard is gate-kept by `BasicAuth`, so set the expected credentials through environment variables if needed (see `.env.example` if available) before logging in.

## Available Scripts

| Script         | Description                                                    |
| -------------- | -------------------------------------------------------------- |
| `npm run dev`  | Start the dev server with TurboPack and file-watching reloads. |
| `npm run lint` | Run ESLint across pages, APIs, and shared components.          |
| `npm run build`| Create an optimized production build (also uses TurboPack).    |
| `npm start`    | Serve the production build.                                    |

## Project Structure (Highlights)

```
src/
├─ components/
│  ├─ layout/AppShell.tsx         # Shared gradient shell + animated blobs
│  ├─ ui/                         # PageHeaderCard, FeatureCard, ProgressBar, etc.
│  ├─ upload/                     # Accessible drop zone + file list widgets
│  └─ feedback/Toast.tsx          # Reusable success/error toasts
├─ pages/
│  ├─ index.tsx                   # Product-style dashboard linking each tool
│  ├─ text-extractor/index.tsx    # Full page OCR flow
│  ├─ title-extractor/index.tsx   # Search-title/link workflow
│  ├─ vision-extractor/index.tsx  # Google Vision-powered title/link workflow
│  └─ redbox/index.tsx            # Red-box CV + OCR scanner
├─ pages/api/                     # Image-processing endpoints (OCR.Space, Vision, OpenCV)
└─ styles/globals.css             # Global Tailwind + animation tokens
```

## How It Works

1. **Upload & Preprocess** – front-end drop zones accept PNG/JPG/BMP screenshots. File lists, progress bars, and toasts provide immediate feedback.
2. **API Processing** – Next.js API routes use `formidable`, `sharp`, `jimp`, OpenCV, and Tesseract.js to parse text, detect red regions, or segment titles+links.
3. **Review & Export** – the UI renders structured cards per file with copy buttons, URL anchors, and fallback states when structured data is missing.

Each extractor runs entirely within your session; no files are persisted after processing.

## Google Vision Title Extractor (Optional)

Need higher-fidelity title, URL, and snippet detection for dense SERP screenshots? Use the Vision workflow at `/vision-extractor`, powered by the `/api/process-image-vision` route:

1. In Google Cloud Console, enable the Vision API for your project and create an API key (or restrict an existing one to Vision only).
2. Store the key in `.env.local` under `GOOGLE_VISION_API_KEY`. Restart `npm run dev` so Next.js picks it up.
3. Drop SERP screenshots into the Google Vision extractor UI; it calls `images:annotate` with `TEXT_DETECTION`, then feeds the cleaned text into the same `extractSearchResults` helper as the OCR.Space workflow.

If you need to tweak the Vision payload, update `src/pages/api/process-image-vision.ts`—the core request looks like:

```ts
await fetch(
  `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: [
        {
          image: { content: imageBuffer.toString("base64") },
          features: [{ type: "TEXT_DETECTION" }],
          imageContext: { languageHints: ["ja"] },
        },
      ],
    }),
  }
);
```

Vision excels at multilingual, tightly packed SERP captures, so prefer it when OCR.Space struggles with vertical text, ruby annotations, or heavy UI chrome.

## Deployment

Deploy like any standard Next.js project (Vercel, Netlify, or self-hosted Node server). If using `next start`, remember to build first:

```bash
npm run build
npm start
```

Ensure any credentials (Basic Auth secrets, API keys) are provided via environment variables in the hosting platform.

## License

This project remains private/internal unless stated otherwise. Update this section if you plan to open-source it.
