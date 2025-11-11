export interface PageContent {
  pageNumber: number;
  content: string;
}

export interface KeyPointWithSource {
  originalPoint: string;
  paraphrasedPoint: string;
  pageNumber: number;
  inTextCitation: string;
}

export interface AnalysisResult {
  summary: string;
  keyPoints: KeyPointWithSource[];
  apaReference: string;
}

export type AppView = 'explore' | 'pdf' | 'library' | 'profile';

export interface SearchResult {
  id: string;
  title: string;
  authors: string[];
  publicationYear: number | null;
  abstract: string;
  pdfUrl?: string;
  sourceUrl?: string;
  journal?: string;
  category?: string;
  citationCount?: number;
}

export interface AnalysisSession {
  id: string;
  fileName: string;
  file: File;
  framework: string;
  status: 'loading' | 'completed' | 'error';
  result?: AnalysisResult;
  pageContents?: PageContent[];
  error?: string;
  createdAt: string;
}

export interface HighlightRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
