// Types for SEO audit data structures

export interface CrawlResult {
  url: string;
  status: number;
  redirectTarget?: string;
  responseTime: number;
  title?: string;
  metaDescription?: string;
  h1Tags: string[];
  canonical?: string;
  robots?: string;
  internalLinks: string[];
  externalLinks: string[];
  images: ImageInfo[];
  schemaMarkup: SchemaInfo[];
}

export interface ImageInfo {
  src: string;
  alt: string | null;
  width: string | null;
  height: string | null;
  fileSize?: number;
}

export interface SchemaInfo {
  type: string;
  valid: boolean;
  errors: string[];
  raw: string;
}

export interface MetaAuditResult {
  url: string;
  title: { value: string | null; length: number; issues: string[] };
  description: { value: string | null; length: number; issues: string[] };
  h1: { values: string[]; issues: string[] };
  canonical: { value: string | null; issues: string[] };
  ogTags: { title: string | null; description: string | null; image: string | null; issues: string[] };
  robotsMeta: { value: string | null; issues: string[] };
}

export interface LinkCheckResult {
  url: string;
  brokenInternalLinks: { href: string; statusCode: number }[];
  brokenExternalLinks: { href: string; statusCode: number }[];
  orphanPages: string[];
  thinLinkedPages: { url: string; internalLinkCount: number }[];
}

export interface CoreWebVitalsResult {
  url: string;
  lcp: { value: number; rating: "good" | "needs-improvement" | "poor" };
  fid: { value: number; rating: "good" | "needs-improvement" | "poor" };
  cls: { value: number; rating: "good" | "needs-improvement" | "poor" };
  overallScore: number;
}

export interface AuditScore {
  crawlability: number;
  onPage: number;
  performance: number;
  contentSignals: number;
  structuredData: number;
  images: number;
  overall: number;
}

export const SEO_CONSTANTS = {
  TITLE_MIN_LENGTH: 30,
  TITLE_MAX_LENGTH: 60,
  DESCRIPTION_MIN_LENGTH: 120,
  DESCRIPTION_MAX_LENGTH: 160,
  ALT_TEXT_MAX_LENGTH: 125,
  MAX_IMAGE_SIZE_KB: 200,
  MIN_INTERNAL_LINKS: 3,
  MAX_REDIRECT_HOPS: 2,
  LCP_GOOD: 2500,
  LCP_POOR: 4000,
  FID_GOOD: 100,
  FID_POOR: 300,
  CLS_GOOD: 0.1,
  CLS_POOR: 0.25,
  MAX_CRAWL_PAGES: 500,
  CRAWL_DELAY_MS: 200,
  REQUEST_TIMEOUT_MS: 10000,
} as const;
