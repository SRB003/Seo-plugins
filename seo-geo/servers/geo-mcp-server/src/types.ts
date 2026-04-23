export interface GeoContentScore {
  citationScore: number;
  statisticsScore: number;
  quotationScore: number;
  fluencyScore: number;
  terminologyScore: number;
  totalScore: number;
  maxScore: number;
  issues: string[];
  strengths: string[];
}

export interface CrawlerAccessResult {
  url: string;
  robotsTxt: string | null;
  blockedBots: string[];
  allowedBots: string[];
  isServerRendered: boolean;
  loadTimeMs: number;
  accessible: boolean;
}

export interface PromptLandscape {
  topic: string;
  corePrompts: string[];
  subQueries: string[];
  coveredPrompts: string[];
  gapPrompts: string[];
  coveragePercentage: number;
}

export const GEO_CONSTANTS = {
  REQUEST_TIMEOUT_MS: 15000,
  CRAWL_DELAY_MS: 400,
  AI_BOT_USER_AGENTS: [
    "GPTBot",
    "ChatGPT-User",
    "PerplexityBot",
    "Google-Extended",
    "ClaudeBot",
    "Applebot-Extended",
    "cohere-ai",
    "Bytespider",
  ],
  MIN_CITATIONS_PER_500_WORDS: 3,
  MIN_STATS_PER_300_WORDS: 1,
  FRESHNESS_THRESHOLD_DAYS: 90,
} as const;
