import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as cheerio from "cheerio";
import { analyzeCompetitorPage, generateModifierSuggestions, generateQuestionVariations, classifyIntent, classifyFunnelStage, estimateDifficulty, extractSerpFeatures, } from "./services/serp-analyzer.js";
import { scoreContent } from "./services/content-scorer.js";
import { CONTENT_CONSTANTS } from "./types.js";
const server = new McpServer({
    name: "content-mcp-server",
    version: "1.0.0",
});
// ─────────────────────────────────────────────
// Helper: fetch with timeout
// ─────────────────────────────────────────────
async function fetchUrl(url) {
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
        return { html: await res.text(), status: res.status };
    }
    finally {
        clearTimeout(timeout);
    }
}
// ─────────────────────────────────────────────
// Tool 1: Keyword Suggestions
// ─────────────────────────────────────────────
server.registerTool("content_keyword_suggestions", {
    title: "Generate Keyword Suggestions",
    description: `Generate expanded keyword suggestions from a seed keyword using modifier patterns, question variations, and intent classification.

Args:
  - seed (string): The seed keyword to expand (e.g., "gym equipment")
  - include_questions (boolean): Also generate question-based variations (default: true)

Returns: List of keyword suggestions with source type and intent classification.`,
    inputSchema: {
        seed: z.string().min(2).max(100).describe("Seed keyword to expand"),
        include_questions: z.boolean().default(true).describe("Include question variations"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
}, async ({ seed, include_questions }) => {
    try {
        const modifiers = generateModifierSuggestions(seed);
        const questions = include_questions ? generateQuestionVariations(seed) : [];
        const all = [...modifiers, ...questions];
        const classified = all.map((s) => ({
            keyword: s.keyword,
            source: s.source,
            intent: classifyIntent(s.keyword),
            funnel_stage: classifyFunnelStage(classifyIntent(s.keyword)),
        }));
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        seed,
                        total_suggestions: classified.length,
                        by_intent: {
                            informational: classified.filter((k) => k.intent === "informational").length,
                            transactional: classified.filter((k) => k.intent === "transactional").length,
                            commercial: classified.filter((k) => k.intent === "commercial").length,
                            navigational: classified.filter((k) => k.intent === "navigational").length,
                        },
                        suggestions: classified,
                    }, null, 2),
                }],
        };
    }
    catch (error) {
        return {
            isError: true,
            content: [{ type: "text", text: `Suggestion generation failed: ${error instanceof Error ? error.message : String(error)}` }],
        };
    }
});
// ─────────────────────────────────────────────
// Tool 2: Analyze SERP
// ─────────────────────────────────────────────
server.registerTool("content_analyze_serp", {
    title: "Analyze SERP for Keyword",
    description: `Analyze the search engine results page for a keyword. Fetches Google results and extracts top-ranking page metadata, People Also Ask questions, related searches, and SERP features.

Note: For reliable SERP data, a SERP API key (SerpAPI, ValueSERP, etc.) is recommended. Without it, this tool scrapes Google directly which may be rate-limited.

Args:
  - keyword (string): The keyword to analyze
  - num_results (number): Number of results to analyze in depth (default: 5, max: 10)

Returns: SERP analysis with top results, PAA, related searches, and competitor content breakdown.`,
    inputSchema: {
        keyword: z.string().min(2).max(200).describe("Keyword to analyze"),
        num_results: z.number().int().min(1).max(10).default(5).describe("Results to analyze in depth"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
}, async ({ keyword, num_results }) => {
    try {
        // Check for SERP API key
        const serpApiKey = process.env.SERP_API_KEY;
        let serpHtml;
        let organicResults = [];
        if (serpApiKey) {
            // Use SerpAPI for reliable data
            const apiUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(keyword)}&api_key=${serpApiKey}&num=${num_results * 2}`;
            const apiRes = await fetch(apiUrl);
            const apiData = (await apiRes.json());
            const organic = (apiData.organic_results || []);
            organicResults = organic.slice(0, num_results * 2).map((r) => ({
                url: r.link,
                title: r.title,
                description: r.snippet,
            }));
            serpHtml = ""; // Don't need raw HTML with API
        }
        else {
            // Fallback: fetch Google directly (may be blocked)
            const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(keyword)}&num=${num_results * 2}`;
            const { html } = await fetchUrl(googleUrl);
            serpHtml = html;
            // Try to extract organic results from HTML
            const $ = cheerio.load(html);
            $(".g, .tF2Cxc").each((_, el) => {
                const link = $(el).find("a").first().attr("href") || "";
                const title = $(el).find("h3").first().text().trim();
                const desc = $(el).find(".VwiC3b, .IsZvec").first().text().trim();
                if (link.startsWith("http") && title) {
                    organicResults.push({ url: link, title, description: desc });
                }
            });
        }
        // Analyze top results in depth
        const detailedResults = [];
        for (const result of organicResults.slice(0, num_results)) {
            try {
                const page = await analyzeCompetitorPage(result.url);
                detailedResults.push({
                    position: detailedResults.length + 1,
                    ...result,
                    ...page,
                });
                await new Promise((r) => setTimeout(r, CONTENT_CONSTANTS.CRAWL_DELAY_MS));
            }
            catch {
                detailedResults.push({
                    position: detailedResults.length + 1,
                    ...result,
                    error: "Could not fetch page for deep analysis",
                });
            }
        }
        // Extract SERP features
        const features = serpHtml ? extractSerpFeatures(serpHtml) : { peopleAlsoAsk: [], relatedSearches: [], serpFeatures: [] };
        // Determine dominant intent from results
        const intent = classifyIntent(keyword);
        // Avg word count
        const wordCounts = detailedResults
            .filter((r) => "estimatedWordCount" in r)
            .map((r) => r.estimatedWordCount);
        const avgWordCount = wordCounts.length > 0 ? Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length) : 0;
        const analysis = {
            keyword,
            intent,
            funnel_stage: classifyFunnelStage(intent),
            results_analyzed: detailedResults.length,
            avg_word_count: avgWordCount,
            recommended_word_count: Math.round(avgWordCount * 1.2),
            serp_features: features.serpFeatures,
            people_also_ask: features.peopleAlsoAsk.slice(0, 8),
            related_searches: features.relatedSearches.slice(0, 8),
            top_results: detailedResults,
        };
        return {
            content: [{ type: "text", text: JSON.stringify(analysis, null, 2) }],
        };
    }
    catch (error) {
        return {
            isError: true,
            content: [{ type: "text", text: `SERP analysis failed: ${error instanceof Error ? error.message : String(error)}` }],
        };
    }
});
// ─────────────────────────────────────────────
// Tool 3: Analyze Competitor
// ─────────────────────────────────────────────
server.registerTool("content_analyze_competitor", {
    title: "Analyze Competitor Site Content",
    description: `Crawl a competitor site and extract their content structure: page titles, H1s, H2 outlines, word counts, and topic coverage. Useful for content gap analysis.

Args:
  - url (string): Competitor site URL
  - max_pages (number): Max pages to analyze (default: 20, max: 100)

Returns: List of competitor pages with content structure and topic coverage map.`,
    inputSchema: {
        url: z.string().url().describe("Competitor site URL"),
        max_pages: z.number().int().min(1).max(100).default(20).describe("Max pages to analyze"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
}, async ({ url, max_pages }) => {
    try {
        const baseUrl = new URL(url).origin;
        const visited = new Set();
        const queue = [url.replace(/\/$/, "").toLowerCase()];
        const pages = [];
        while (queue.length > 0 && pages.length < max_pages) {
            const currentUrl = queue.shift();
            if (visited.has(currentUrl))
                continue;
            visited.add(currentUrl);
            try {
                const page = await analyzeCompetitorPage(currentUrl);
                pages.push(page);
                // Discover more pages
                const { html } = await fetchUrl(currentUrl);
                const $ = cheerio.load(html);
                $("a[href]").each((_, el) => {
                    const href = $(el).attr("href");
                    if (!href)
                        return;
                    try {
                        const resolved = new URL(href, currentUrl).href.replace(/\/$/, "").toLowerCase();
                        if (resolved.startsWith(baseUrl) && !visited.has(resolved) && !queue.includes(resolved)) {
                            queue.push(resolved);
                        }
                    }
                    catch { /* skip */ }
                });
                await new Promise((r) => setTimeout(r, CONTENT_CONSTANTS.CRAWL_DELAY_MS));
            }
            catch {
                // Skip failed pages
            }
        }
        // Build topic map from H1s and titles
        const topicMap = pages.map((p) => ({
            url: p.url,
            topic: p.h1 || p.title,
            sections: p.h2s,
            word_count: p.estimatedWordCount,
            has_schema: p.hasSchema,
        }));
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        competitor: baseUrl,
                        pages_analyzed: pages.length,
                        avg_word_count: Math.round(pages.reduce((s, p) => s + p.estimatedWordCount, 0) / Math.max(1, pages.length)),
                        schema_adoption_rate: `${Math.round((pages.filter((p) => p.hasSchema).length / Math.max(1, pages.length)) * 100)}%`,
                        topic_map: topicMap,
                    }, null, 2),
                }],
        };
    }
    catch (error) {
        return {
            isError: true,
            content: [{ type: "text", text: `Competitor analysis failed: ${error instanceof Error ? error.message : String(error)}` }],
        };
    }
});
// ─────────────────────────────────────────────
// Tool 4: Estimate Keyword Difficulty
// ─────────────────────────────────────────────
server.registerTool("content_estimate_difficulty", {
    title: "Estimate Keyword Difficulty",
    description: `Estimate how difficult it would be to rank for a keyword by analyzing the current top-ranking pages: their content depth, domain authority signals, schema usage, and internal linking.

Args:
  - keyword (string): The keyword to evaluate
  - num_results (number): Number of top results to analyze (default: 5)

Returns: Difficulty rating (easy/medium/hard/very-hard), score (0-100), and supporting signals.`,
    inputSchema: {
        keyword: z.string().min(2).describe("Keyword to evaluate difficulty for"),
        num_results: z.number().int().min(3).max(10).default(5).describe("Top results to analyze"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
}, async ({ keyword, num_results }) => {
    try {
        // Fetch SERP
        const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(keyword)}&num=${num_results * 2}`;
        const { html } = await fetchUrl(googleUrl);
        const $ = cheerio.load(html);
        const urls = [];
        $(".g a, .tF2Cxc a").each((_, el) => {
            const href = $(el).attr("href") || "";
            if (href.startsWith("http") && !urls.includes(href))
                urls.push(href);
        });
        // Analyze top pages
        const competitorPages = [];
        for (const pageUrl of urls.slice(0, num_results)) {
            try {
                const page = await analyzeCompetitorPage(pageUrl);
                competitorPages.push(page);
                await new Promise((r) => setTimeout(r, CONTENT_CONSTANTS.CRAWL_DELAY_MS));
            }
            catch { /* skip */ }
        }
        const difficulty = estimateDifficulty(competitorPages, keyword);
        return {
            content: [{ type: "text", text: JSON.stringify(difficulty, null, 2) }],
        };
    }
    catch (error) {
        return {
            isError: true,
            content: [{ type: "text", text: `Difficulty estimation failed: ${error instanceof Error ? error.message : String(error)}` }],
        };
    }
});
// ─────────────────────────────────────────────
// Tool 5: Find Content Gaps
// ─────────────────────────────────────────────
server.registerTool("content_find_gaps", {
    title: "Find Content Gaps vs Competitors",
    description: `Compare your site's content coverage against a competitor to find topics they cover that you don't.

Args:
  - your_site (string): Your site URL
  - competitor_site (string): Competitor site URL
  - max_pages (number): Max pages to analyze per site (default: 30)

Returns: List of topics the competitor covers that are missing from your site.`,
    inputSchema: {
        your_site: z.string().url().describe("Your site URL"),
        competitor_site: z.string().url().describe("Competitor site URL"),
        max_pages: z.number().int().min(5).max(50).default(30).describe("Max pages per site"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: true },
}, async ({ your_site, competitor_site, max_pages }) => {
    try {
        // Helper: crawl a site and extract topics
        async function crawlTopics(siteUrl, maxPages) {
            const baseUrl = new URL(siteUrl).origin;
            const visited = new Set();
            const queue = [siteUrl.replace(/\/$/, "").toLowerCase()];
            const topics = [];
            while (queue.length > 0 && topics.length < maxPages) {
                const currentUrl = queue.shift();
                if (visited.has(currentUrl))
                    continue;
                visited.add(currentUrl);
                try {
                    const { html } = await fetchUrl(currentUrl);
                    const pg$ = cheerio.load(html);
                    const h1 = pg$("h1").first().text().trim();
                    const title = pg$("title").first().text().trim();
                    if (h1)
                        topics.push(h1.toLowerCase());
                    else if (title)
                        topics.push(title.toLowerCase());
                    pg$("a[href]").each((_, el) => {
                        const href = pg$(el).attr("href");
                        if (!href)
                            return;
                        try {
                            const resolved = new URL(href, currentUrl).href.replace(/\/$/, "").toLowerCase();
                            if (resolved.startsWith(baseUrl) && !visited.has(resolved) && !queue.includes(resolved)) {
                                queue.push(resolved);
                            }
                        }
                        catch { /* skip */ }
                    });
                    await new Promise((r) => setTimeout(r, CONTENT_CONSTANTS.CRAWL_DELAY_MS));
                }
                catch { /* skip */ }
            }
            return topics;
        }
        const [yourTopics, competitorTopics] = await Promise.all([
            crawlTopics(your_site, max_pages),
            crawlTopics(competitor_site, max_pages),
        ]);
        // Find topics that appear in competitor but not in your site
        // Use fuzzy matching — check if competitor topic words appear in any of your topics
        const gaps = competitorTopics.filter((compTopic) => {
            const compWords = compTopic.split(/\s+/).filter((w) => w.length > 3);
            return !yourTopics.some((yourTopic) => {
                const matchCount = compWords.filter((w) => yourTopic.includes(w)).length;
                return matchCount / Math.max(1, compWords.length) > 0.5;
            });
        });
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        your_site,
                        competitor_site,
                        your_topics_found: yourTopics.length,
                        competitor_topics_found: competitorTopics.length,
                        content_gaps: gaps.length,
                        gap_topics: gaps,
                        recommendation: gaps.length > 0
                            ? `Found ${gaps.length} topics the competitor covers that you don't. Consider creating content for these topics, prioritized by relevance to your business.`
                            : "No significant content gaps found — your coverage is competitive.",
                    }, null, 2),
                }],
        };
    }
    catch (error) {
        return {
            isError: true,
            content: [{ type: "text", text: `Gap analysis failed: ${error instanceof Error ? error.message : String(error)}` }],
        };
    }
});
// ─────────────────────────────────────────────
// Tool 6: Score Content Draft
// ─────────────────────────────────────────────
server.registerTool("content_score_draft", {
    title: "Score Content for SEO",
    description: `Score a content draft against a 100-point SEO scorecard covering keyword optimization, structure, readability, technical SEO, quality, and engagement.

Args:
  - content (string): The content body in markdown format
  - primary_keyword (string): The target keyword
  - secondary_keywords (string[]): Optional secondary keywords to check for
  - target_word_count (number): Optional target word count
  - meta_title (string): Optional meta title to validate
  - meta_description (string): Optional meta description to validate
  - slug (string): Optional URL slug to validate

Returns: Detailed score breakdown with category scores, issues, and strengths.`,
    inputSchema: {
        content: z.string().min(50).describe("Content body in markdown"),
        primary_keyword: z.string().min(2).describe("Primary target keyword"),
        secondary_keywords: z.array(z.string()).default([]).describe("Secondary keywords to check"),
        target_word_count: z.number().int().min(100).optional().describe("Target word count"),
        meta_title: z.string().optional().describe("Meta title to validate"),
        meta_description: z.string().optional().describe("Meta description to validate"),
        slug: z.string().optional().describe("URL slug to validate"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
}, async ({ content, primary_keyword, secondary_keywords, target_word_count, meta_title, meta_description, slug }) => {
    try {
        const result = scoreContent(content, primary_keyword, secondary_keywords, target_word_count, meta_title, meta_description, slug);
        // Build visual score bar
        const allIssues = [
            ...result.categories.keywordOptimization.issues.map((i) => ({ category: "Keyword", issue: i, severity: "important" })),
            ...result.categories.contentStructure.issues.map((i) => ({ category: "Structure", issue: i, severity: "important" })),
            ...result.categories.readability.issues.map((i) => ({ category: "Readability", issue: i, severity: "important" })),
            ...result.categories.technicalSeo.issues.map((i) => ({ category: "Technical", issue: i, severity: "important" })),
            ...result.categories.contentQuality.issues.map((i) => ({ category: "Quality", issue: i, severity: "nice-to-have" })),
            ...result.categories.engagement.issues.map((i) => ({ category: "Engagement", issue: i, severity: "nice-to-have" })),
        ];
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        score: result.totalScore,
                        rating: result.rating,
                        publish_ready: result.totalScore >= 75,
                        categories: result.categories,
                        strengths: result.strengths,
                        all_issues: allIssues,
                        recommendation: result.totalScore >= 90 ? "Excellent — ready to publish." :
                            result.totalScore >= 75 ? "Good — minor tweaks recommended, safe to publish." :
                                result.totalScore >= 60 ? "Fair — address critical issues before publishing." :
                                    result.totalScore >= 40 ? "Poor — significant revision needed." :
                                        "Failing — consider rewriting from the content brief.",
                    }, null, 2),
                }],
        };
    }
    catch (error) {
        return {
            isError: true,
            content: [{ type: "text", text: `Scoring failed: ${error instanceof Error ? error.message : String(error)}` }],
        };
    }
});
// ─────────────────────────────────────────────
// Tool 7: Score URL (fetch + score)
// ─────────────────────────────────────────────
server.registerTool("content_score_url", {
    title: "Score Live Page for SEO",
    description: `Fetch a live page and score its content for SEO quality.

Args:
  - url (string): The page URL to score
  - primary_keyword (string): The target keyword for this page
  - secondary_keywords (string[]): Optional secondary keywords

Returns: SEO score breakdown for the live page content.`,
    inputSchema: {
        url: z.string().url().describe("Page URL to score"),
        primary_keyword: z.string().min(2).describe("Target keyword"),
        secondary_keywords: z.array(z.string()).default([]).describe("Secondary keywords"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
}, async ({ url, primary_keyword, secondary_keywords }) => {
    try {
        const { html, status } = await fetchUrl(url);
        if (status !== 200) {
            return { content: [{ type: "text", text: `Page returned HTTP ${status}. Cannot score.` }] };
        }
        const $ = cheerio.load(html);
        // Extract content as markdown-like text
        const title = $("title").first().text().trim();
        const metaDesc = $('meta[name="description"]').attr("content") || "";
        const bodyHtml = $("article, main, .content, .post-content, .entry-content").first().html() || $("body").html() || "";
        // Convert to rough markdown
        const body$ = cheerio.load(bodyHtml);
        let markdown = "";
        body$("h1, h2, h3, h4, h5, h6, p, li, td").each((_, el) => {
            const tag = el.tagName;
            const text = body$(el).text().trim();
            if (!text)
                return;
            if (tag === "h1")
                markdown += `# ${text}\n\n`;
            else if (tag === "h2")
                markdown += `## ${text}\n\n`;
            else if (tag === "h3")
                markdown += `### ${text}\n\n`;
            else if (tag === "li")
                markdown += `- ${text}\n`;
            else
                markdown += `${text}\n\n`;
        });
        const slug = new URL(url).pathname.replace(/^\//, "").replace(/\/$/, "");
        const wordCount = markdown.split(/\s+/).length;
        const scoreResult = scoreContent(markdown, primary_keyword, secondary_keywords, undefined, title, metaDesc, slug);
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        url,
                        word_count: wordCount,
                        meta_title: title,
                        meta_description: metaDesc,
                        slug,
                        ...scoreResult,
                    }, null, 2),
                }],
        };
    }
    catch (error) {
        return {
            isError: true,
            content: [{ type: "text", text: `Page scoring failed: ${error instanceof Error ? error.message : String(error)}` }],
        };
    }
});
// ─────────────────────────────────────────────
// Tool 8: Related Keywords (LSI)
// ─────────────────────────────────────────────
server.registerTool("content_related_keywords", {
    title: "Find Related Keywords (LSI)",
    description: `Find semantically related keywords by analyzing the content of top-ranking pages for a seed keyword. Extracts common terms and phrases used across ranking content.

Args:
  - keyword (string): The seed keyword
  - num_pages (number): Number of top pages to analyze (default: 5)

Returns: List of related terms found across ranking content, sorted by frequency.`,
    inputSchema: {
        keyword: z.string().min(2).describe("Seed keyword"),
        num_pages: z.number().int().min(2).max(10).default(5).describe("Top pages to analyze"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
}, async ({ keyword, num_pages }) => {
    try {
        const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(keyword)}&num=${num_pages * 2}`;
        const { html } = await fetchUrl(googleUrl);
        const $ = cheerio.load(html);
        const urls = [];
        $(".g a, .tF2Cxc a").each((_, el) => {
            const href = $(el).attr("href") || "";
            if (href.startsWith("http") && !urls.includes(href))
                urls.push(href);
        });
        // Extract text from top pages
        const wordFrequency = new Map();
        const stopWords = new Set([
            "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
            "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
            "being", "have", "has", "had", "do", "does", "did", "will", "would",
            "could", "should", "may", "might", "shall", "can", "need", "must",
            "this", "that", "these", "those", "it", "its", "you", "your", "we",
            "our", "they", "their", "he", "she", "his", "her", "my", "me",
            "not", "no", "so", "if", "as", "up", "out", "about", "than",
            "more", "also", "just", "very", "all", "any", "each", "every",
            "some", "such", "there", "here", "when", "where", "how", "what",
            "which", "who", "whom", "why", "other", "into", "over", "after",
        ]);
        const seedWords = new Set(keyword.toLowerCase().split(/\s+/));
        for (const pageUrl of urls.slice(0, num_pages)) {
            try {
                const page = await fetchUrl(pageUrl);
                const pg$ = cheerio.load(page.html);
                const text = pg$("article, main, .content, body").first().text().toLowerCase();
                const words = text.split(/\s+/).filter((w) => w.length > 3 && !stopWords.has(w) && !seedWords.has(w) && /^[a-z]+$/.test(w));
                for (const word of words) {
                    wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
                }
                await new Promise((r) => setTimeout(r, CONTENT_CONSTANTS.CRAWL_DELAY_MS));
            }
            catch { /* skip */ }
        }
        // Sort by frequency and return top terms
        const sorted = [...wordFrequency.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 50)
            .map(([term, frequency]) => ({ term, frequency }));
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        seed_keyword: keyword,
                        pages_analyzed: Math.min(urls.length, num_pages),
                        related_terms: sorted,
                    }, null, 2),
                }],
        };
    }
    catch (error) {
        return {
            isError: true,
            content: [{ type: "text", text: `Related keywords failed: ${error instanceof Error ? error.message : String(error)}` }],
        };
    }
});
// ─────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Content Engine MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map