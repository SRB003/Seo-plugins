export interface SnippetOpportunity {
    keyword: string;
    hasSnippet: boolean;
    snippetType: "paragraph" | "list" | "table" | "none";
    currentHolder: string | null;
    youOwnIt: boolean;
    opportunity: "steal" | "defend" | "new" | "none";
    paaQuestions: string[];
}
export interface AeoPageAudit {
    url: string;
    answerFirstScore: number;
    questionHeadingsScore: number;
    factDensityScore: number;
    citationQualityScore: number;
    eeatSignalsScore: number;
    schemaScore: number;
    freshnessScore: number;
    totalAeoScore: number;
    issues: string[];
    strengths: string[];
}
export interface AiVisibilityResult {
    query: string;
    platform: string;
    brandMentioned: boolean;
    domainCited: boolean;
    citationUrl: string | null;
    mentionContext: string | null;
    sentiment: "positive" | "neutral" | "negative" | null;
    competitorsMentioned: string[];
}
export declare const AEO_CONSTANTS: {
    readonly REQUEST_TIMEOUT_MS: 15000;
    readonly CRAWL_DELAY_MS: 400;
    readonly OPTIMAL_ANSWER_LENGTH_MIN: 40;
    readonly OPTIMAL_ANSWER_LENGTH_MAX: 60;
    readonly FACTS_PER_300_WORDS: 1;
    readonly FRESHNESS_THRESHOLD_DAYS: 90;
};
