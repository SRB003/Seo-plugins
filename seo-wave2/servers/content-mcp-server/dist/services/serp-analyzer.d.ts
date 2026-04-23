import { type KeywordSuggestion, type CompetitorPage, type DifficultyEstimate } from "../types.js";
/**
 * Analyze a competitor page for content structure
 */
export declare function analyzeCompetitorPage(url: string): Promise<CompetitorPage>;
/**
 * Generate keyword suggestions using modifier patterns
 */
export declare function generateModifierSuggestions(seed: string): KeywordSuggestion[];
/**
 * Generate question-based keyword variations
 */
export declare function generateQuestionVariations(seed: string): KeywordSuggestion[];
/**
 * Classify search intent based on keyword patterns
 */
export declare function classifyIntent(keyword: string): "informational" | "transactional" | "commercial" | "navigational";
/**
 * Classify funnel stage
 */
export declare function classifyFunnelStage(intent: string): "tofu" | "mofu" | "bofu";
/**
 * Estimate keyword difficulty by analyzing SERP characteristics
 */
export declare function estimateDifficulty(competitorPages: CompetitorPage[], keyword: string): DifficultyEstimate;
/**
 * Extract People Also Ask and related searches from HTML
 * (Works on Google SERP HTML — may need SERP API for reliable extraction)
 */
export declare function extractSerpFeatures(html: string): {
    peopleAlsoAsk: string[];
    relatedSearches: string[];
    serpFeatures: string[];
};
//# sourceMappingURL=serp-analyzer.d.ts.map