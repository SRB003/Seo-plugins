import * as cheerio from "cheerio";
import {
  CONTENT_CONSTANTS,
  type SerpResult,
  type SerpAnalysis,
  type KeywordSuggestion,
  type CompetitorPage,
  type DifficultyEstimate,
} from "../types.js";

/**
 * Fetch a URL with timeout
 */
async function fetchUrl(url: string): Promise<{ html: string; status: number }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CONTENT_CONSTANTS.REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SEO-Content-Bot/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    const html = await res.text();
    return { html, status: res.status };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Analyze a competitor page for content structure
 */
export async function analyzeCompetitorPage(url: string): Promise<CompetitorPage> {
  const { html } = await fetchUrl(url);
  const $ = cheerio.load(html);

  const title = $("title").first().text().trim();
  const h1 = $("h1").first().text().trim();
  const h2s: string[] = [];
  $("h2").each((_, el) => {
    const text = $(el).text().trim();
    if (text) h2s.push(text);
  });

  // Estimate word count from main content area
  const bodyText = $("article, main, .content, .post-content, .entry-content, body")
    .first()
    .text()
    .replace(/\s+/g, " ")
    .trim();
  const estimatedWordCount = bodyText.split(/\s+/).length;

  const baseUrl = new URL(url).origin;
  let internalLinks = 0;
  let externalLinks = 0;
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    try {
      const resolved = new URL(href, url).href;
      if (resolved.startsWith(baseUrl)) internalLinks++;
      else externalLinks++;
    } catch {
      // skip
    }
  });

  const hasSchema = $('script[type="application/ld+json"]').length > 0;

  return { url, title, h1, h2s, estimatedWordCount, internalLinks, externalLinks, hasSchema };
}

/**
 * Generate keyword suggestions using modifier patterns
 */
export function generateModifierSuggestions(seed: string): KeywordSuggestion[] {
  const prefixes = [
    "best", "top", "how to", "what is", "why", "when to",
    "guide to", "tips for", "cheap", "affordable", "premium",
    "professional",
  ];
  const suffixes = [
    "for beginners", "for small business", "tips", "guide",
    "examples", "alternatives", "vs", "review", "benefits",
    "cost", "price", "near me", "online", "in india",
  ];

  const suggestions: KeywordSuggestion[] = [];

  for (const prefix of prefixes) {
    suggestions.push({ keyword: `${prefix} ${seed}`, source: "modifier" });
  }
  for (const suffix of suffixes) {
    suggestions.push({ keyword: `${seed} ${suffix}`, source: "modifier" });
  }

  return suggestions;
}

/**
 * Generate question-based keyword variations
 */
export function generateQuestionVariations(seed: string): KeywordSuggestion[] {
  const patterns = [
    `what is ${seed}`,
    `how does ${seed} work`,
    `how to use ${seed}`,
    `how to choose ${seed}`,
    `why is ${seed} important`,
    `when to use ${seed}`,
    `where to buy ${seed}`,
    `is ${seed} worth it`,
    `${seed} vs what`,
    `can you ${seed}`,
    `how much does ${seed} cost`,
    `what are the benefits of ${seed}`,
    `how to get started with ${seed}`,
    `what are the best ${seed}`,
  ];

  return patterns.map((kw) => ({ keyword: kw, source: "modifier" as const }));
}

/**
 * Classify search intent based on keyword patterns
 */
export function classifyIntent(keyword: string): "informational" | "transactional" | "commercial" | "navigational" {
  const kw = keyword.toLowerCase();

  // Transactional signals
  if (/\b(buy|purchase|order|shop|deal|discount|coupon|price|pricing|cheap|affordable)\b/.test(kw)) {
    return "transactional";
  }

  // Commercial investigation
  if (/\b(best|top|review|compare|comparison|vs|versus|alternative|recommended)\b/.test(kw)) {
    return "commercial";
  }

  // Navigational
  if (/\b(login|sign in|website|official|contact|address|phone number)\b/.test(kw)) {
    return "navigational";
  }

  // Default: informational
  return "informational";
}

/**
 * Classify funnel stage
 */
export function classifyFunnelStage(intent: string): "tofu" | "mofu" | "bofu" {
  if (intent === "informational") return "tofu";
  if (intent === "commercial") return "mofu";
  return "bofu";
}

/**
 * Estimate keyword difficulty by analyzing SERP characteristics
 */
export function estimateDifficulty(
  competitorPages: CompetitorPage[],
  keyword: string
): DifficultyEstimate {
  if (competitorPages.length === 0) {
    return {
      keyword,
      difficulty: "easy",
      score: 10,
      signals: {
        avgDomainAuthority: "unknown",
        topResultTypes: [],
        contentDepth: "unknown",
        backlinksNeeded: "minimal",
      },
    };
  }

  let score = 0;

  // Word count signal — high word counts = more competitive
  const avgWordCount =
    competitorPages.reduce((s, p) => s + p.estimatedWordCount, 0) / competitorPages.length;
  if (avgWordCount > 3000) score += 30;
  else if (avgWordCount > 2000) score += 20;
  else if (avgWordCount > 1000) score += 10;

  // Schema adoption — more schema = more sophisticated competitors
  const schemaRate = competitorPages.filter((p) => p.hasSchema).length / competitorPages.length;
  if (schemaRate > 0.5) score += 15;
  else if (schemaRate > 0.2) score += 8;

  // Internal linking depth — more links = more authority
  const avgInternalLinks =
    competitorPages.reduce((s, p) => s + p.internalLinks, 0) / competitorPages.length;
  if (avgInternalLinks > 50) score += 20;
  else if (avgInternalLinks > 20) score += 10;

  // Domain variety check — big brands = harder
  const domains = [...new Set(competitorPages.map((p) => new URL(p.url).hostname))];
  const bigBrands = ["wikipedia.org", "amazon.com", "youtube.com", "reddit.com", "forbes.com", "healthline.com"];
  const brandCount = domains.filter((d) => bigBrands.some((b) => d.includes(b))).length;
  if (brandCount >= 3) score += 25;
  else if (brandCount >= 1) score += 12;

  score = Math.min(100, score);

  const difficulty: DifficultyEstimate["difficulty"] =
    score <= 25 ? "easy" : score <= 50 ? "medium" : score <= 75 ? "hard" : "very-hard";

  return {
    keyword,
    difficulty,
    score,
    signals: {
      avgDomainAuthority: brandCount >= 2 ? "high (major brands)" : brandCount >= 1 ? "mixed" : "low-medium",
      topResultTypes: [...new Set(competitorPages.map((p) => (p.h2s.length > 5 ? "long-form guide" : "standard article")))],
      contentDepth: avgWordCount > 2000 ? "deep (2000+ words avg)" : avgWordCount > 1000 ? "moderate" : "thin",
      backlinksNeeded: score > 60 ? "significant" : score > 30 ? "moderate" : "minimal",
    },
  };
}

/**
 * Extract People Also Ask and related searches from HTML
 * (Works on Google SERP HTML — may need SERP API for reliable extraction)
 */
export function extractSerpFeatures(html: string): {
  peopleAlsoAsk: string[];
  relatedSearches: string[];
  serpFeatures: string[];
} {
  const $ = cheerio.load(html);
  const peopleAlsoAsk: string[] = [];
  const relatedSearches: string[] = [];
  const serpFeatures: string[] = [];

  // PAA detection (generic patterns)
  $('[data-q], .related-question-pair, [jsname="Cpkphb"]').each((_, el) => {
    const q = $(el).attr("data-q") || $(el).text().trim();
    if (q && q.length > 10 && q.length < 200) peopleAlsoAsk.push(q);
  });

  // Related searches
  $(".k8XOCe, .s75CSd, .brs_col a").each((_, el) => {
    const text = $(el).text().trim();
    if (text) relatedSearches.push(text);
  });

  // Feature detection
  if ($(".featured-snippet, .xpdopen, [data-attrid='wa:/description']").length > 0) {
    serpFeatures.push("featured_snippet");
  }
  if ($(".commercial-unit, .pla-unit, .cu-container").length > 0) {
    serpFeatures.push("shopping_results");
  }
  if ($("video-voyager, .video-block, g-inner-card video").length > 0) {
    serpFeatures.push("video_carousel");
  }
  if ($(".kp-wholepage, .knowledge-panel").length > 0) {
    serpFeatures.push("knowledge_panel");
  }
  if ($(".AEprdc, [data-local-attribute]").length > 0) {
    serpFeatures.push("local_pack");
  }

  return { peopleAlsoAsk, relatedSearches, serpFeatures };
}
