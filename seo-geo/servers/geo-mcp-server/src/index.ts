import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as cheerio from "cheerio";
import { GEO_CONSTANTS } from "./types.js";

const server = new McpServer({ name: "geo-mcp-server", version: "1.0.0" });

async function fetchUrl(url: string): Promise<{ html: string; status: number; loadTime: number }> {
  const start = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEO_CONSTANTS.REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; GEO-Bot/1.0)", Accept: "text/html" },
    });
    return { html: await res.text(), status: res.status, loadTime: Date.now() - start };
  } finally { clearTimeout(timeout); }
}

// ─── Tool 1: Audit Content for GEO ───

server.registerTool("geo_audit_content", {
  title: "Audit Content for GEO Readiness",
  description: `Score content against the 5 GEO techniques from Princeton research: citations, statistics, quotations, fluency, and technical terminology.

Args:
  - url (string): Page URL to audit

Returns: Score breakdown per technique with specific improvement recommendations.`,
  inputSchema: { url: z.string().url().describe("Page URL to audit") },
  annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
}, async ({ url }) => {
  try {
    const { html, loadTime } = await fetchUrl(url);
    const $ = cheerio.load(html);
    const bodyText = $("article, main, .content, body").first().text().replace(/\s+/g, " ").trim();
    const words = bodyText.split(/\s+/);
    const totalWords = words.length;
    const issues: string[] = [];
    const strengths: string[] = [];

    // 1. Citations (20 pts)
    const externalLinks = $("a[href^='http']").filter((_, el) => {
      try { return new URL($(el).attr("href") || "").hostname !== new URL(url).hostname; } catch { return false; }
    });
    const citationsPer500 = (externalLinks.length / Math.max(1, totalWords)) * 500;
    const citationScore = Math.min(20, Math.round(citationsPer500 * (20 / GEO_CONSTANTS.MIN_CITATIONS_PER_500_WORDS)));
    if (citationScore < 12) issues.push(`Low citation density (${externalLinks.length} citations in ${totalWords} words). Target ${GEO_CONSTANTS.MIN_CITATIONS_PER_500_WORDS}+ per 500 words.`);
    else strengths.push(`Good citation density: ${externalLinks.length} external references`);

    // Check for "According to" patterns (proper attribution)
    const attributionPatterns = (bodyText.match(/according to|research (from|by|shows)|study (by|from|shows)|data from|report (by|from)/gi) || []).length;
    if (attributionPatterns >= 3) strengths.push("Strong source attribution language");
    else issues.push("Add attribution phrases like 'According to [Source]' for cited facts");

    // 2. Statistics (20 pts)
    const statMatches = bodyText.match(/\d+(\.\d+)?%|\$\d[\d,.]*|\d[\d,]*\s*(million|billion|thousand|users|customers|businesses|companies|people|hours|days|years)/gi) || [];
    const statsPer300 = (statMatches.length / Math.max(1, totalWords)) * 300;
    const statsScore = Math.min(20, Math.round(statsPer300 * (20 / GEO_CONSTANTS.MIN_STATS_PER_300_WORDS)));
    if (statsScore < 12) issues.push(`Low statistic density (${statMatches.length} data points). Add specific numbers with sources.`);
    else strengths.push(`Strong data density: ${statMatches.length} statistics/data points`);

    // 3. Quotations (15 pts)
    const quoteMatches = bodyText.match(/"[^"]{20,200}"/g) || [];
    const hasAttributedQuotes = (bodyText.match(/(says|states|notes|explains|according to)\s*[A-Z][a-z]+/g) || []).length;
    const quoteScore = Math.min(15, quoteMatches.length * 3 + hasAttributedQuotes * 2);
    if (quoteScore < 6) issues.push("No expert quotes found. Add attributed quotes from industry experts.");
    else strengths.push(`${quoteMatches.length} expert quotes with attribution`);

    // 4. Fluency (25 pts)
    const sentences = bodyText.split(/[.!?]+/).filter((s) => s.trim().length > 10);
    const avgSentenceLength = totalWords / Math.max(1, sentences.length);
    const hedgingWords = (bodyText.match(/\b(might|could|possibly|perhaps|maybe|somewhat|fairly|rather|quite|it seems)\b/gi) || []).length;
    const passiveVoice = (bodyText.match(/\b(is|are|was|were|been|being)\s+\w+ed\b/gi) || []).length;

    let fluencyScore = 25;
    if (avgSentenceLength > 22) { fluencyScore -= 8; issues.push(`Average sentence too long (${avgSentenceLength.toFixed(1)} words). Target 15-18.`); }
    else if (avgSentenceLength > 18) { fluencyScore -= 3; }
    else { strengths.push(`Clean sentence length: avg ${avgSentenceLength.toFixed(1)} words`); }
    if (hedgingWords > 5) { fluencyScore -= 5; issues.push(`${hedgingWords} hedging words found. Replace with definitive language.`); }
    if (passiveVoice > sentences.length * 0.3) { fluencyScore -= 5; issues.push("High passive voice usage. Switch to active voice."); }
    fluencyScore = Math.max(0, fluencyScore);

    // 5. Technical Terminology (20 pts)
    // Check for capitalized technical terms, acronyms, and domain-specific language
    const acronyms = (bodyText.match(/\b[A-Z]{2,6}\b/g) || []).length;
    const technicalTerms = (bodyText.match(/\b(API|SEO|ROI|CRM|SaaS|B2B|B2C|KPI|CTR|CPC|LTV|MRR|ARR|CAGR|NPS)\b/gi) || []).length;
    const termScore = Math.min(20, acronyms + technicalTerms * 2);
    if (termScore < 8) issues.push("Low technical terminology. Use precise domain terms where appropriate.");
    else strengths.push("Good use of technical terminology");

    const totalScore = citationScore + statsScore + quoteScore + fluencyScore + termScore;

    return {
      content: [{ type: "text", text: JSON.stringify({
        url,
        word_count: totalWords,
        load_time_ms: loadTime,
        geo_score: totalScore,
        max_score: 100,
        rating: totalScore >= 80 ? "excellent" : totalScore >= 60 ? "good" : totalScore >= 40 ? "fair" : "needs_work",
        breakdown: {
          citations: { score: citationScore, max: 20, count: externalLinks.length },
          statistics: { score: statsScore, max: 20, count: statMatches.length },
          quotations: { score: quoteScore, max: 15, count: quoteMatches.length },
          fluency: { score: fluencyScore, max: 25, avg_sentence_length: Math.round(avgSentenceLength * 10) / 10 },
          terminology: { score: termScore, max: 20 },
        },
        issues, strengths,
        estimated_improvement: `Fixing all issues could improve AI visibility by ~${Math.min(40, Math.round((100 - totalScore) * 0.4))}%`,
      }, null, 2) }],
    };
  } catch (error) {
    return { isError: true, content: [{ type: "text", text: `GEO audit failed: ${error instanceof Error ? error.message : String(error)}` }] };
  }
});

// ─── Tool 2: Check AI Crawler Access ───

server.registerTool("geo_check_crawlers", {
  title: "Check AI Crawler Access",
  description: `Verify whether AI search engine crawlers (GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot, Google-Extended) can access your site.

Args:
  - url (string): Site URL to check

Returns: robots.txt analysis showing which AI bots are blocked/allowed, plus page accessibility check.`,
  inputSchema: { url: z.string().url().describe("Site URL to check") },
  annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
}, async ({ url }) => {
  try {
    const baseUrl = new URL(url).origin;

    // Fetch robots.txt
    let robotsTxt: string | null = null;
    try {
      const robotsRes = await fetch(`${baseUrl}/robots.txt`);
      if (robotsRes.ok) robotsTxt = await robotsRes.text();
    } catch { /* no robots.txt */ }

    const blocked: string[] = [];
    const allowed: string[] = [];

    if (robotsTxt) {
      const lines = robotsTxt.toLowerCase().split("\n");
      let currentAgent = "*";

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("user-agent:")) {
          currentAgent = trimmed.replace("user-agent:", "").trim();
        }
        if (trimmed.startsWith("disallow: /") || trimmed === "disallow: /") {
          // Check if this disallow applies to any AI bot
          for (const bot of GEO_CONSTANTS.AI_BOT_USER_AGENTS) {
            if (currentAgent === "*" || currentAgent.toLowerCase().includes(bot.toLowerCase())) {
              if (!blocked.includes(bot)) blocked.push(bot);
            }
          }
        }
      }

      // Bots not blocked are allowed
      for (const bot of GEO_CONSTANTS.AI_BOT_USER_AGENTS) {
        if (!blocked.includes(bot) && !allowed.includes(bot)) allowed.push(bot);
      }
    } else {
      // No robots.txt = all allowed
      allowed.push(...GEO_CONSTANTS.AI_BOT_USER_AGENTS);
    }

    // Check page accessibility
    const { loadTime, status } = await fetchUrl(url);

    // Check for JavaScript-only rendering
    const { html } = await fetchUrl(url);
    const $ = cheerio.load(html);
    const bodyText = $("body").text().replace(/\s+/g, " ").trim();
    const isServerRendered = bodyText.length > 200; // Rough check — very short body = likely JS-rendered

    return {
      content: [{ type: "text", text: JSON.stringify({
        url,
        robots_txt_exists: !!robotsTxt,
        ai_bots_blocked: blocked,
        ai_bots_allowed: allowed,
        critical_blocked: blocked.filter((b) => ["GPTBot", "ChatGPT-User", "PerplexityBot", "Google-Extended"].includes(b)),
        page_status: status,
        load_time_ms: loadTime,
        likely_server_rendered: isServerRendered,
        overall_accessible: blocked.length === 0 && status === 200 && isServerRendered,
        recommendations: [
          ...blocked.map((b) => `⚠️ ${b} is blocked in robots.txt — add "Allow: /" for this user agent`),
          ...(status !== 200 ? [`🔴 Page returned HTTP ${status}`] : []),
          ...(!isServerRendered ? ["🔴 Page appears to be JavaScript-rendered only — AI crawlers may not see content"] : []),
          ...(loadTime > 3000 ? [`🟡 Slow load time (${loadTime}ms) — may affect crawl priority`] : []),
        ],
      }, null, 2) }],
    };
  } catch (error) {
    return { isError: true, content: [{ type: "text", text: `Crawler check failed: ${error instanceof Error ? error.message : String(error)}` }] };
  }
});

// ─── Tool 3: Analyze Prompt Landscape ───

server.registerTool("geo_analyze_prompt_landscape", {
  title: "Analyze Prompt Landscape for Topic",
  description: `Generate prompt variations and sub-query fan-out patterns for a topic. Helps identify the full range of AI queries your content should cover.

Args:
  - topic (string): Core topic or niche (e.g., "home gym equipment")
  - target_domain (string): Your domain (to check coverage)

Returns: Core prompts, sub-queries, and coverage analysis.`,
  inputSchema: {
    topic: z.string().min(2).max(100).describe("Core topic"),
    target_domain: z.string().min(3).describe("Your domain"),
  },
  annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
}, async ({ topic, target_domain }) => {
  try {
    // Generate prompt variations
    const promptPatterns = [
      `what is ${topic}`,
      `best ${topic}`,
      `${topic} guide`,
      `how to choose ${topic}`,
      `${topic} comparison`,
      `${topic} for beginners`,
      `${topic} cost price`,
      `is ${topic} worth it`,
      `${topic} vs alternatives`,
      `${topic} recommendations`,
      `how does ${topic} work`,
      `${topic} benefits`,
      `${topic} problems issues`,
      `top ${topic} brands`,
      `${topic} reviews`,
    ];

    // Generate sub-queries (simulating AI fan-out)
    const subQueries = [
      `${topic} 2026`,
      `${topic} buying guide`,
      `${topic} features comparison`,
      `${topic} expert opinion`,
      `${topic} user reviews`,
      `${topic} specifications`,
      `${topic} setup installation`,
      `${topic} maintenance`,
      `${topic} safety`,
      `${topic} alternatives`,
    ];

    // Check which prompts the domain covers
    const serpApiKey = process.env.SERP_API_KEY;
    const normalizedDomain = target_domain.replace(/^https?:\/\//, "").replace(/^www\./, "");
    const covered: string[] = [];
    const gaps: string[] = [];

    // Check a sample of prompts
    const samplePrompts = promptPatterns.slice(0, 5);
    for (const prompt of samplePrompts) {
      try {
        if (serpApiKey) {
          const apiUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(prompt)}&api_key=${serpApiKey}&num=10`;
          const res = await fetch(apiUrl);
          const data = (await res.json()) as Record<string, unknown>;
          const organic = (data.organic_results || []) as Array<{ link: string }>;
          const found = organic.some((r) => r.link.includes(normalizedDomain));
          if (found) covered.push(prompt);
          else gaps.push(prompt);
        } else {
          gaps.push(prompt); // Can't check without API
        }
        await new Promise((r) => setTimeout(r, GEO_CONSTANTS.CRAWL_DELAY_MS));
      } catch {
        gaps.push(prompt);
      }
    }

    // Estimate full coverage
    const coverageRate = samplePrompts.length > 0 ? covered.length / samplePrompts.length : 0;

    return {
      content: [{ type: "text", text: JSON.stringify({
        topic,
        target_domain,
        core_prompts: promptPatterns,
        sub_queries: subQueries,
        total_prompt_universe: promptPatterns.length + subQueries.length,
        sample_checked: samplePrompts.length,
        covered: covered,
        gaps: gaps,
        estimated_coverage: `${Math.round(coverageRate * 100)}%`,
        recommendation: coverageRate < 0.5
          ? `Low prompt coverage. Create content addressing the ${gaps.length} gap prompts identified.`
          : coverageRate < 0.8
          ? "Moderate coverage. Fill remaining gaps to dominate AI answers for this topic."
          : "Strong coverage. Focus on content quality and authority to win citations.",
      }, null, 2) }],
    };
  } catch (error) {
    return { isError: true, content: [{ type: "text", text: `Prompt analysis failed: ${error instanceof Error ? error.message : String(error)}` }] };
  }
});

// ─── Start ───

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("GEO MCP Server running on stdio");
}

main().catch((error) => { console.error("Server error:", error); process.exit(1); });
