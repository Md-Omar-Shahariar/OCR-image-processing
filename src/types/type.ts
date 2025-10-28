export const config = {
  api: {
    bodyParser: false,
    responseLimit: "10mb",
  },
};

export interface OcrSpaceParsedResult {
  ParsedText?: string;
}

export interface OcrSpaceResponse {
  IsErroredOnProcessing?: boolean;
  ErrorMessage?: string[];
  ParsedResults?: OcrSpaceParsedResult[];
}

export interface ApiResponse {
  status: "success" | "error";
  text?: string;
  searchResults?: SearchResult[];
  resultsCount?: number;
  rawText?: string;
  message?: string;
}

export interface SearchResult {
  title: string;
  url: string;
  description?: string;
}
