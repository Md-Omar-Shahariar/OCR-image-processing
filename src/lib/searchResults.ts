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

    const urlMatch = line.match(
      /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?(?:\/[^\s]*)?)/
    );

    if (urlMatch) {
      const lineParts = line.split(" ");
      const urlIndex = lineParts.findIndex((part) =>
        part.includes(urlMatch[0])
      );

      isUrlLine = urlIndex === 0;

      if (isUrlLine) {
        const url = urlMatch[0];

        let title = "";
        let description = "";

        if (i + 1 < lines.length) {
          const potentialTitle = lines[i + 1];

          if (
            potentialTitle &&
            potentialTitle.length >= 2 &&
            potentialTitle.length < 300 &&
            !potentialTitle.match(/https?:\/\//) &&
            !potentialTitle.match(/^[0-9\s\.-]+$/)
          ) {
            title = potentialTitle;

            const descriptionLines: string[] = [];

            for (let j = i + 2; j <= i + 3 && j < lines.length; j++) {
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

  return results.filter(
    (result, index, self) =>
      index === self.findIndex((r) => r.url === result.url)
  );
}
