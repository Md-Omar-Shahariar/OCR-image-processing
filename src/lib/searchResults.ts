import { SearchResult } from "@/types/type";

/**
 * Normalize OCR output so downstream parsing runs on consistent text.
 */
export function cleanText(text: string): string {
  return text
    .split("\n")
    .map((line) =>
      line
        .replace(/^Q[ ,、]?\s*\d*[.:]?\s*/g, "")
        .replace(/[●•▪▫○◙◘►▼▲]/g, "")
        .replace(/[!?]{2,}/g, "")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter((line) => line.length > 0)
    .join("\n");
}

/**
 * Extract SERP-style title, URL, and description tuples.
 */
export function extractSearchResults(text: string): SearchResult[] {
  const results: SearchResult[] = [];
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  let isUrlLine = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const urlMatch = line.match(/https?:\/\/[^\s]+/);

    if (urlMatch) {
      console.log(urlMatch.length, "MATCH...................");
      const lineParts = line.split(/\s+/);
      const urlIndex = lineParts.findIndex((part) =>
        part.includes(urlMatch[0])
      );
      const firstToken = lineParts[0] || "";
      const tokenIsMarker =
        /^[^\w一-龯ぁ-んァ-ン]+$/.test(firstToken) ||
        /^([\(\[]?[A-Za-z]{1,3}[\)\]]?)$/.test(firstToken);

      isUrlLine = urlIndex === 0 || (urlIndex === 1 && tokenIsMarker);

      if (isUrlLine) {
        // Clean URLs that are truncated with ellipses from OCR.
        const url = urlMatch[0].replace(/[.…]+$/g, "");

        let title = "";
        let description = "";
        let titleLineIndex = -1;

        for (let j = i + 1; j < lines.length; j++) {
          const candidate = lines[j];

          if (
            !candidate ||
            /^[^\w一-龯ぁ-んァ-ン]+$/.test(candidate) ||
            candidate.match(/https?:\/\//) ||
            candidate.match(/^[0-9\s\.-]+$/)
          ) {
            continue;
          }

          if (candidate.length >= 2 && candidate.length < 300) {
            title = candidate;
            titleLineIndex = j;
            break;
          }
        }

        if (title && titleLineIndex !== -1) {
          const descriptionLines: string[] = [];

          for (
            let j = titleLineIndex + 1;
            j <= titleLineIndex + 2 && j < lines.length;
            j++
          ) {
            const descLine = lines[j];
            if (
              descLine &&
              descLine.length > 3 &&
              !descLine.match(/https?:\/\//)
            ) {
              descriptionLines.push(descLine);
            }
          }

          if (descriptionLines.length > 0) {
            description = descriptionLines.join(" ");
          }
        }

        title = title
          .replace(/^[●•▪▫○◙◘►▼▲\s]+/, "")
          .replace(/[●•▪▫○◙◘►▼▲\s]+$/, "")
          .trim();

        description = description
          .replace(/^[●•▪▫○◙◘►▼▲\s]+/, "")
          .replace(/[●•▪▫○◙◘►▼▲\s]+$/, "")
          .trim();

        if (title && url) {
          const fullUrl = url.startsWith("http") ? url : `https://${url}`;

          results.push({
            title: title,
            url: fullUrl,
            description: description || undefined,
          });
        }
      }
    }
  }
  console.log(results.length, "res/..................");
  return results;
}
