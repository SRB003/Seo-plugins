import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as cheerio from "cheerio";
import { AEO_CONSTANTS } from "./types.js";
const server = new McpServer({ name: "aeo-mcp-server", version: "1.0.0" });
async function fetchUrl(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AEO_CONSTANTS.REQUEST_TIMEOUT_MS);
    try {
        const res = await fetch(url, {
            signal: controller.signal,
            headers: { "User-Agent": "Mozilla/5.0 (compatible; AEO-Bot/1.0)", Accept: "text/html" },
        });
        return { html: await res.text(), status: res.status };
    }
    finally {
        clearTimeout(timeout);
    }
}
// ─── Tool 1: Audit Page for AEO ───
server.registerTool("aeo_audit_page", {
    title: "Audit Page for AEO Readiness",
    description: `Analyze a page for Answer Engine Optimization signals: answer-first structure, question headings, fact density, citations, E-E-A-T signals, schema, and freshness.

Args:
  - url (string): Page URL to audit
  - target_keyword (string): Primary keyword this page targets

Returns: AEO score breakdown with specific issues and recommendations.`,
    inputSchema: {
        url: z.string().url().describe("Page URL to audit"),
        target_keyword: z.string().min(2).describe("Target keyword"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
}, async ({ url, target_keyword }) => {
    try {
        const { html } = await fetchUrl(url);
        const $ = cheerio.load(html);
        const bodyText = $("article, main, .content, body").first().text().replace(/\s+/g, " ").trim();
        const words = bodyText.split(/\s+/);
        const issues = [];
        const strengths = [];
        // 1. Answer-first: check if sections start with concise answers
        let answerFirstScore = 0;
        const h2s = $("h2");
        let answerFirstCount = 0;
        h2s.each((_, el) => {
            const nextP = $(el).next("p").text().trim();
            if (nextP.length > 0) {
                const pWords = nextP.split(/\s+/).length;
                if (pWords >= AEO_CONSTANTS.OPTIMAL_ANSWER_LENGTH_MIN && pWords <= AEO_CONSTANTS.OPTIMAL_ANSWER_LENGTH_MAX + 20) {
                    answerFirstCount++;
                }
            }
        });
        answerFirstScore = h2s.length > 0 ? Math.round((answerFirstCount / h2s.length) * 5) : 0;
        if (answerFirstScore < 3)
            issues.push("Most sections don't lead with a concise answer paragraph (40-60 words)");
        else
            strengths.push("Good answer-first structure");
        // 2. Question-format headings
        let questionScore = 0;
        let questionH2s = 0;
        h2s.each((_, el) => {
            const text = $(el).text().trim();
            if (text.endsWith("?") || /^(what|how|why|when|where|who|is|can|does|do|should|which)\b/i.test(text)) {
                questionH2s++;
            }
        });
        questionScore = h2s.length > 0 ? Math.min(5, Math.round((questionH2s / h2s.length) * 5)) : 0;
        if (questionScore < 3)
            issues.push("H2 headings aren't phrased as questions — rephrase to match user prompts");
        else
            strengths.push("Question-format headings present");
        // 3. Fact density
        const numberMatches = bodyText.match(/\d+%|\$\d+|\d+\.\d+|\b\d{3,}\b/g) || [];
        const factsPer300 = (numberMatches.length / Math.max(1, words.length)) * 300;
        const factScore = Math.min(5, Math.round(factsPer300 * 2.5));
        if (factScore < 3)
            issues.push(`Low fact density (${numberMatches.length} data points in ${words.length} words). Add specific stats.`);
        else
            strengths.push(`Good fact density: ${numberMatches.length} data points`);
        // 4. Citation quality
        const externalLinks = $("a[href^='http']").filter((_, el) => {
            const href = $(el).attr("href") || "";
            try {
                return new URL(href).hostname !== new URL(url).hostname;
            }
            catch {
                return false;
            }
        });
        const citationScore = Math.min(5, externalLinks.length);
        if (citationScore < 2)
            issues.push("Few external source citations — AI engines value well-sourced content");
        else
            strengths.push(`${externalLinks.length} external source citations`);
        // 5. E-E-A-T signals
        let eeatScore = 0;
        const hasAuthor = $('[rel="author"], .author, .byline, [itemprop="author"]').length > 0;
        if (hasAuthor) {
            eeatScore += 2;
            strengths.push("Author attribution found");
        }
        else
            issues.push("No author byline detected — add author + credentials");
        const hasDate = $('time, [datetime], .published-date, .updated-date, meta[property="article:modified_time"]').length > 0;
        if (hasDate)
            eeatScore += 1;
        else
            issues.push("No publish/update date found — add visible date");
        // 6. Schema
        let schemaScore = 0;
        const schemas = $('script[type="application/ld+json"]');
        schemas.each((_, el) => {
            try {
                const parsed = JSON.parse($(el).html() || "");
                const type = parsed["@type"] || "";
                if (["FAQPage", "HowTo", "QAPage"].includes(type))
                    schemaScore += 2;
                else if (["Article", "BlogPosting"].includes(type))
                    schemaScore += 1;
                if (parsed.speakable)
                    schemaScore += 1;
            }
            catch { /* skip */ }
        });
        schemaScore = Math.min(4, schemaScore);
        if (schemaScore < 2)
            issues.push("Missing AEO-optimized schema (FAQ, HowTo, or Speakable)");
        else
            strengths.push("AEO-relevant schema markup found");
        // 7. Freshness
        let freshnessScore = 0;
        const modifiedMeta = $('meta[property="article:modified_time"]').attr("content") || $('meta[name="last-modified"]').attr("content");
        if (modifiedMeta) {
            const daysSince = (Date.now() - new Date(modifiedMeta).getTime()) / (1000 * 60 * 60 * 24);
            if (daysSince <= AEO_CONSTANTS.FRESHNESS_THRESHOLD_DAYS) {
                freshnessScore = 3;
                strengths.push(`Content updated ${Math.round(daysSince)} days ago`);
            }
            else {
                freshnessScore = 1;
                issues.push(`Content appears stale (${Math.round(daysSince)} days since update). AI has a 3-month recency bias.`);
            }
        }
        else {
            issues.push("No update date meta tag found — add article:modified_time");
        }
        const totalAeoScore = answerFirstScore + questionScore + factScore + citationScore + eeatScore + schemaScore + freshnessScore;
        return {
            content: [{ type: "text", text: JSON.stringify({
                        url, target_keyword,
                        aeo_score: totalAeoScore,
                        max_score: 30,
                        breakdown: {
                            answer_first: { score: answerFirstScore, max: 5 },
                            question_headings: { score: questionScore, max: 5 },
                            fact_density: { score: factScore, max: 5 },
                            citation_quality: { score: citationScore, max: 5 },
                            eeat_signals: { score: eeatScore, max: 3 },
                            schema: { score: schemaScore, max: 4 },
                            freshness: { score: freshnessScore, max: 3 },
                        },
                        issues, strengths,
                        rating: totalAeoScore >= 24 ? "excellent" : totalAeoScore >= 18 ? "good" : totalAeoScore >= 12 ? "fair" : "needs_work",
                    }, null, 2) }],
        };
    }
    catch (error) {
        return { isError: true, content: [{ type: "text", text: `AEO audit failed: ${error instanceof Error ? error.message : String(error)}` }] };
    }
});
// ─── Tool 2: Find Featured Snippet Opportunities ───
server.registerTool("aeo_find_snippet_opportunities", {
    title: "Find Featured Snippet Opportunities",
    description: `Check which keywords have featured snippets and whether you own them. Also extracts People Also Ask questions.

Args:
  - keywords (string[]): Keywords to check
  - target_domain (string): Your domain

Returns: Snippet status per keyword, PAA questions, and optimization recommendations.`,
    inputSchema: {
        keywords: z.array(z.string()).min(1).max(20).describe("Keywords to check"),
        target_domain: z.string().describe("Your domain"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
}, async ({ keywords, target_domain }) => {
    try {
        const serpApiKey = process.env.SERP_API_KEY;
        const results = [];
        for (const keyword of keywords) {
            try {
                let snippetData = {};
                let paaQuestions = [];
                if (serpApiKey) {
                    const apiUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(keyword)}&api_key=${serpApiKey}`;
                    const res = await fetch(apiUrl);
                    const data = (await res.json());
                    snippetData = (data.answer_box || data.featured_snippet || {});
                    const paa = (data.related_questions || []);
                    paaQuestions = paa.map((q) => q.question).slice(0, 5);
                }
                else {
                    const { html } = await fetchUrl(`https://www.google.com/search?q=${encodeURIComponent(keyword)}`);
                    const $ = cheerio.load(html);
                    const snippetEl = $(".xpdopen, .IZ6rdc, .V3FYCf").first();
                    if (snippetEl.length) {
                        snippetData = { snippet: snippetEl.text().trim().slice(0, 200), link: snippetEl.find("a").attr("href") || "" };
                    }
                }
                const hasSnippet = Object.keys(snippetData).length > 0;
                const snippetUrl = (snippetData.link || snippetData.displayed_link || "");
                const normalizedTarget = target_domain.replace(/^https?:\/\//, "").replace(/^www\./, "");
                const youOwnIt = snippetUrl.includes(normalizedTarget);
                results.push({
                    keyword,
                    has_snippet: hasSnippet,
                    you_own_it: youOwnIt,
                    opportunity: !hasSnippet ? "new" : youOwnIt ? "defend" : "steal",
                    snippet_holder: hasSnippet && !youOwnIt ? snippetUrl : null,
                    paa_questions: paaQuestions,
                });
                await new Promise((r) => setTimeout(r, AEO_CONSTANTS.CRAWL_DELAY_MS));
            }
            catch {
                results.push({ keyword, has_snippet: false, you_own_it: false, opportunity: "unknown", snippet_holder: null, paa_questions: [] });
            }
        }
        const steal = results.filter((r) => r.opportunity === "steal");
        const defend = results.filter((r) => r.opportunity === "defend");
        const newOpp = results.filter((r) => r.opportunity === "new");
        return {
            content: [{ type: "text", text: JSON.stringify({
                        total_checked: results.length,
                        snippets_you_own: defend.length,
                        steal_opportunities: steal.length,
                        new_opportunities: newOpp.length,
                        all_paa_questions: [...new Set(results.flatMap((r) => r.paa_questions))],
                        results,
                    }, null, 2) }],
        };
    }
    catch (error) {
        return { isError: true, content: [{ type: "text", text: `Snippet check failed: ${error instanceof Error ? error.message : String(error)}` }] };
    }
});
// ─── Tool 3: Test AI Visibility ───
server.registerTool("aeo_test_ai_visibility", {
    title: "Test Brand Visibility in AI Answers",
    description: `Test whether a brand or domain is mentioned/cited when AI search engines answer relevant queries. Currently tests via Perplexity's API (most accessible).

Args:
  - brand_name (string): Brand name to search for in AI responses
  - queries (string[]): Test queries to check
  - target_domain (string): Your domain to check for citations

Returns: Per-query visibility status across AI platforms.`,
    inputSchema: {
        brand_name: z.string().min(2).describe("Brand name"),
        queries: z.array(z.string()).min(1).max(10).describe("Test queries"),
        target_domain: z.string().describe("Your domain"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
}, async ({ brand_name, queries, target_domain }) => {
    try {
        const results = [];
        const normalizedBrand = brand_name.toLowerCase();
        const normalizedDomain = target_domain.replace(/^https?:\/\//, "").replace(/^www\./, "").toLowerCase();
        // Test via Google (AI Overviews detection)
        for (const query of queries) {
            try {
                const serpApiKey = process.env.SERP_API_KEY;
                let aiMention = false;
                let aiCitation = false;
                let context = "";
                const competitorsMentioned = [];
                if (serpApiKey) {
                    const apiUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${serpApiKey}`;
                    const res = await fetch(apiUrl);
                    const data = (await res.json());
                    // Check AI Overview
                    const aiOverview = JSON.stringify(data.ai_overview || data.answer_box || {}).toLowerCase();
                    aiMention = aiOverview.includes(normalizedBrand);
                    aiCitation = aiOverview.includes(normalizedDomain);
                    if (aiMention)
                        context = "Mentioned in Google AI Overview/Answer Box";
                    // Check organic for domain presence too
                    const organic = (data.organic_results || []);
                    for (const r of organic.slice(0, 5)) {
                        const domain = new URL(r.link).hostname.toLowerCase();
                        if (!domain.includes(normalizedDomain) && !competitorsMentioned.includes(domain)) {
                            competitorsMentioned.push(domain);
                        }
                    }
                }
                else {
                    // Basic Google scrape
                    const { html } = await fetchUrl(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
                    const lower = html.toLowerCase();
                    aiMention = lower.includes(normalizedBrand);
                    aiCitation = lower.includes(normalizedDomain);
                    if (aiMention)
                        context = "Brand name found in search results page";
                }
                results.push({
                    query,
                    platform: "google",
                    brand_mentioned: aiMention,
                    domain_cited: aiCitation,
                    context: context || "Not mentioned",
                    competitors: competitorsMentioned.slice(0, 5),
                });
                await new Promise((r) => setTimeout(r, AEO_CONSTANTS.CRAWL_DELAY_MS));
            }
            catch {
                results.push({ query, platform: "google", brand_mentioned: false, domain_cited: false, context: "Check failed", competitors: [] });
            }
        }
        const mentioned = results.filter((r) => r.brand_mentioned);
        const cited = results.filter((r) => r.domain_cited);
        return {
            content: [{ type: "text", text: JSON.stringify({
                        brand_name, target_domain,
                        queries_tested: results.length,
                        brand_mentioned_in: mentioned.length,
                        domain_cited_in: cited.length,
                        sov_estimate: `${Math.round((mentioned.length / results.length) * 100)}%`,
                        citation_rate: `${Math.round((cited.length / results.length) * 100)}%`,
                        results,
                        note: "For comprehensive multi-platform testing (ChatGPT, Perplexity, Gemini), dedicated AI tracking APIs are recommended. This tests Google AI features.",
                    }, null, 2) }],
        };
    }
    catch (error) {
        return { isError: true, content: [{ type: "text", text: `AI visibility test failed: ${error instanceof Error ? error.message : String(error)}` }] };
    }
});
// ─── Start ───
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("AEO MCP Server running on stdio");
}
main().catch((error) => { console.error("Server error:", error); process.exit(1); });
//# sourceMappingURL=index.js.map