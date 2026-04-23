export interface SerpResult {
    position: number;
    url: string;
    title: string;
    description: string;
    domain: string;
}
export interface SerpAnalysis {
    keyword: string;
    results: SerpResult[];
    peopleAlsoAsk: string[];
    relatedSearches: string[];
    serpFeatures: string[];
    dominantIntent: "informational" | "transactional" | "commercial" | "navigational";
    dominantContentType: string;
    avgWordCount: number;
}
export interface KeywordSuggestion {
    keyword: string;
    source: "autocomplete" | "related" | "paa" | "modifier" | "competitor";
}
export interface CompetitorPage {
    url: string;
    title: string;
    h1: string;
    h2s: string[];
    estimatedWordCount: number;
    internalLinks: number;
    externalLinks: number;
    hasSchema: boolean;
}
export interface ContentScoreResult {
    totalScore: number;
    categories: {
        keywordOptimization: {
            score: number;
            max: 25;
            issues: string[];
        };
        contentStructure: {
            score: number;
            max: 20;
            issues: string[];
        };
        readability: {
            score: number;
            max: 20;
            issues: string[];
        };
        technicalSeo: {
            score: number;
            max: 15;
            issues: string[];
        };
        contentQuality: {
            score: number;
            max: 10;
            issues: string[];
        };
        engagement: {
            score: number;
            max: 10;
            issues: string[];
        };
    };
    strengths: string[];
    rating: "excellent" | "good" | "fair" | "poor" | "failing";
}
export interface DifficultyEstimate {
    keyword: string;
    difficulty: "easy" | "medium" | "hard" | "very-hard";
    score: number;
    signals: {
        avgDomainAuthority: string;
        topResultTypes: string[];
        contentDepth: string;
        backlinksNeeded: string;
    };
}
export declare const CONTENT_CONSTANTS: {
    readonly SERP_RESULTS_TO_ANALYZE: 10;
    readonly MAX_KEYWORD_SUGGESTIONS: 50;
    readonly MAX_COMPETITOR_PAGES: 100;
    readonly IDEAL_KEYWORD_DENSITY_MIN: 0.01;
    readonly IDEAL_KEYWORD_DENSITY_MAX: 0.02;
    readonly MIN_WORD_COUNT: 300;
    readonly MAX_PARAGRAPH_SENTENCES: 4;
    readonly IDEAL_SENTENCE_LENGTH: 20;
    readonly MIN_FLESCH_SCORE: 60;
    readonly MIN_HEADING_RATIO: 300;
    readonly FILLER_PHRASES: readonly ["in today's world", "it's important to note", "it goes without saying", "in this article we will", "without further ado", "at the end of the day", "it is worth mentioning", "needless to say", "as we all know", "in the modern era", "in this day and age", "when all is said and done"];
    readonly REQUEST_TIMEOUT_MS: 15000;
    readonly CRAWL_DELAY_MS: 300;
};
//# sourceMappingURL=types.d.ts.map