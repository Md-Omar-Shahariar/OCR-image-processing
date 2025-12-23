# OCR Vision Suite

OCR Vision Suite is an internal-friendly toolkit built with Next.js 15 that turns screenshots into structured, copy‑ready data. It now ships with flexible engine switches so you can pick the right OCR per upload:

- **Full Page OCR** – batch extract text from documents/PDFs with a CopyFish (OCR.Space) or Google Vision toggle.
- **Title & Link Extractor** – pull titles, URLs, and snippets from search result screenshots using either CopyFish or Google Vision.
- **Google Vision Extractor** – a dedicated Vision workspace for multilingual SERP screenshots when OCR.Space struggles.
- **Video Frame OCR** – sample frames from short videos, run Vision OCR, and browse the results in a gallery+modal viewer.
- **Red Box Scanner** – detect red-highlighted regions via OpenCV and read the enclosed text with Tesseract.js.
- **Multilingual (EN/JA)** – UI copy is localized via next-i18next with a nav toggle; the default locale is Japanese.

All tools share a cohesive, responsive UI, built-in drag-and-drop uploads, toasts, and guided states to make repeated OCR tasks fast and pleasant.

## Prerequisites

- Node.js 18+
- npm (bundled with Node) or another supported package manager (yarn, pnpm, bun)
- If you need i18n support locally, ensure `next-i18next`, `i18next`, and `react-i18next` are installed (already in package.json).

## Local Development

```bash
# Install dependencies
npm install

# Start the Next.js app with TurboPack
npm run dev
```

Visit <http://localhost:3000>. The dashboard is gate-kept by `BasicAuth`, so set the expected credentials through environment variables if needed (see `.env.example` if available) before logging in.
The default locale is Japanese; after login you will be redirected to `/ja`. Use the nav toggle to switch to English.

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
│  ├─ video/FrameCard.tsx         # Video frame gallery card with modal trigger
│  └─ feedback/Toast.tsx          # Reusable success/error toasts
├─ pages/
│  ├─ index.tsx                   # Product-style dashboard linking each tool
│  ├─ text-extractor/index.tsx    # Classic OCR.Space full page flow
│  ├─ vision-fullpage/index.tsx   # Google Vision full page OCR flow
│  ├─ vision-extractor/index.tsx  # Google Vision-powered title/link workflow
│  ├─ title-extractor/index.tsx   # OCR.Space title extractor (legacy)
│  ├─ video-vision/index.tsx      # Video frame OCR workflow with gallery modal
│  └─ redbox/index.tsx            # Red-box CV + OCR scanner
├─ pages/api/                     # Image-processing endpoints (OCR.Space, Vision, OpenCV)
├─ public/locales/{en,ja}/        # Translation resources (common, home, videoVision)
└─ styles/globals.css             # Global Tailwind + animation tokens
```

## How It Works

1. **Upload & Preprocess** – front-end drop zones accept PNG/JPG/BMP screenshots. File lists, progress bars, and toasts provide immediate feedback.
2. **API Processing** – Next.js API routes use `formidable`, `sharp`, `jimp`, OpenCV, and Tesseract.js to parse text, detect red regions, or segment titles+links.
3. **Review & Export** – the UI renders structured cards per file with copy buttons, URL anchors, and fallback states when structured data is missing.

Each extractor runs entirely within your session; no files are persisted after processing.

## Internationalization (EN/JA)

- Default locale: `ja`. The nav toggle switches between Japanese and English; BasicAuth redirects to `/ja` after login.
- Translations live in `public/locales/{en,ja}/`. Namespaces in use: `common`, `home`, `videoVision`.
- Pages using translations must export `getStaticProps` with `serverSideTranslations(locale, [...namespaces])`.
- New UI strings should be added to both `en` and `ja` files to avoid fallback flicker.

## Google Vision Workflows

Need higher-fidelity extraction for dense layouts? Two Google Vision flows are available once you provide an API key:

- **Title & Link mode** – UI at `/vision-extractor`, API at `/api/process-image-vision`, best for SERP screenshots (`TEXT_DETECTION`).
- **Full Page mode** – UI at `/vision-fullpage`, API at `/api/process-fullpage-vision`, best for scans or documents (`DOCUMENT_TEXT_DETECTION`).

> Tip: the standard `/text-extractor` and `/title-extractor` pages now include an engine selector so you can swap between CopyFish and Google Vision without leaving the workflow. The dedicated Vision pages remain available if you prefer a Vision-only environment.

Setup steps:

1. In Google Cloud Console, enable the Vision API for your project and create an API key (or restrict an existing one to Vision only).
2. Store the key in `.env.local` under `GOOGLE_VISION_API_KEY`. Restart `npm run dev` so Next.js picks it up.
3. Drop screenshots into the respective Vision workflow—each route calls `images:annotate` with the feature type listed above, then either parses titles/links or normalizes the full transcript.

If you need to tweak the Vision payload, update `src/pages/api/process-image-vision.ts` or `src/pages/api/process-fullpage-vision.ts`—the core request looks like:

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
