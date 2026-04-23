// Types for content engine data structures
export const CONTENT_CONSTANTS = {
    SERP_RESULTS_TO_ANALYZE: 10,
    MAX_KEYWORD_SUGGESTIONS: 50,
    MAX_COMPETITOR_PAGES: 100,
    IDEAL_KEYWORD_DENSITY_MIN: 0.01,
    IDEAL_KEYWORD_DENSITY_MAX: 0.02,
    MIN_WORD_COUNT: 300,
    MAX_PARAGRAPH_SENTENCES: 4,
    IDEAL_SENTENCE_LENGTH: 20,
    MIN_FLESCH_SCORE: 60,
    MIN_HEADING_RATIO: 300, // 1 H2 per 300 words
    FILLER_PHRASES: [
        "in today's world",
        "it's important to note",
        "it goes without saying",
        "in this article we will",
        "without further ado",
        "at the end of the day",
        "it is worth mentioning",
        "needless to say",
        "as we all know",
        "in the modern era",
        "in this day and age",
        "when all is said and done",
    ],
    REQUEST_TIMEOUT_MS: 15000,
    CRAWL_DELAY_MS: 300,
};
//# sourceMappingURL=types.js.map