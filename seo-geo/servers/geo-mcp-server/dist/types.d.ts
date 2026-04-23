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
export declare const GEO_CONSTANTS: {
    readonly REQUEST_TIMEOUT_MS: 15000;
    readonly CRAWL_DELAY_MS: 400;
    readonly AI_BOT_USER_AGENTS: readonly ["GPTBot", "ChatGPT-User", "PerplexityBot", "Google-Extended", "ClaudeBot", "Applebot-Extended", "cohere-ai", "Bytespider"];
    readonly MIN_CITATIONS_PER_500_WORDS: 3;
    readonly MIN_STATS_PER_300_WORDS: 1;
    readonly FRESHNESS_THRESHOLD_DAYS: 90;
};
