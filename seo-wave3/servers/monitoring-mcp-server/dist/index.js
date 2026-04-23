import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as cheerio from "cheerio";
import { checkRanking, checkAlgorithmUpdates, findLinkProspects, findBrokenLinksOnSite, } from "./services/monitor-utils.js";
import { MONITOR_CONSTANTS } from "./types.js";
const server = new McpServer({
    name: "monitoring-mcp-server",
    version: "1.0.0",
});
// ─────────────────────────────────────────────
// Tool 1: Check Rankings
// ─────────────────────────────────────────────
server.registerTool("monitor_check_rankings", {
    title: "Check Keyword Rankings",
    description: `Check the current SERP position for one or more keywords against a target domain. Uses SERP API if available, falls back to direct scraping.

Args:
  - keywords (string[]): Keywords to check positions for
  - target_domain (string): Your domain to find in results (e.g., "example.com")

Returns: Position (1-30 or null), ranking URL, SERP features, and top competitors for each keyword.`,
    inputSchema: {
        keywords: z.array(z.string()).min(1).max(50).describe("Keywords to check"),
        target_domain: z.string().min(3).describe("Target domain (e.g., example.com)"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
}, async ({ keywords, target_domain }) => {
    try {
        const serpApiKey = process.env.SERP_API_KEY;
        const results = [];
        for (const keyword of keywords) {
            try {
                const result = await checkRanking(keyword, target_domain, serpApiKey);
                results.push(result);
                await new Promise((r) => setTimeout(r, MONITOR_CONSTANTS.CRAWL_DELAY_MS));
            }
            catch (err) {
                results.push({
                    keyword,
                    position: null,
                    rankingUrl: null,
                    serpFeatures: [],
                    topCompetitors: [],
                    error: err instanceof Error ? err.message : "Check failed",
                });
            }
        }
        const found = results.filter((r) => r.position !== null);
        const top3 = found.filter((r) => r.position !== null && r.position <= 3);
        const top10 = found.filter((r) => r.position !== null && r.position <= 10);
        const summary = {
            target_domain,
            total_checked: results.length,
            found_in_top_30: found.length,
            top_3: top3.length,
            top_10: top10.length,
            not_found: results.length - found.length,
            results: results.map((r) => ({
                keyword: r.keyword,
                position: r.position,
                ranking_url: r.rankingUrl,
                serp_features: r.serpFeatures,
                top_competitors: r.topCompetitors,
            })),
        };
        return { content: [{ type: "text", text: JSON.stringify(summary, null, 2) }] };
    }
    catch (error) {
        return {
            isError: true,
            content: [{ type: "text", text: `Ranking check failed: ${error instanceof Error ? error.message : String(error)}` }],
        };
    }
});
// ─────────────────────────────────────────────
// Tool 2: Check Algorithm Updates
// ─────────────────────────────────────────────
server.registerTool("monitor_check_algorithm_updates", {
    title: "Check Google Algorithm Updates",
    description: `Search for recent confirmed and suspected Google algorithm updates. Useful for diagnosing ranking changes.

Args:
  - days_back (number): How many days back to look (default: 30, max: 90)

Returns: List of updates with name, date, confirmed status, description, and target areas.`,
    inputSchema: {
        days_back: z.number().int().min(7).max(90).default(30).describe("Days back to search"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
}, async ({ days_back }) => {
    try {
        const updates = await checkAlgorithmUpdates(days_back);
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        period_days: days_back,
                        updates_found: updates.length,
                        updates,
                        note: updates.length === 0
                            ? "No confirmed algorithm updates found in this period. Note: this tool searches public sources and may not catch all updates."
                            : undefined,
                    }, null, 2),
                }],
        };
    }
    catch (error) {
        return {
            isError: true,
            content: [{ type: "text", text: `Algorithm update check failed: ${error instanceof Error ? error.message : String(error)}` }],
        };
    }
});
// ─────────────────────────────────────────────
// Tool 3: Find Link Prospects
// ─────────────────────────────────────────────
server.registerTool("monitor_find_link_prospects", {
    title: "Find Link Building Prospects",
    description: `Discover potential link building targets for a given niche and strategy.

Args:
  - niche (string): Your niche or topic area (e.g., "fitness equipment", "luxury travel")
  - strategy (string): Link building strategy — guest_post, broken_link, resource, or skyscraper
  - max_results (number): Maximum prospects to find (default: 15, max: 30)

Returns: List of prospect sites with URL, title, relevance signals, and quality score.`,
    inputSchema: {
        niche: z.string().min(2).max(100).describe("Your niche or topic area"),
        strategy: z.enum(["guest_post", "broken_link", "resource", "skyscraper"]).describe("Outreach strategy"),
        max_results: z.number().int().min(5).max(30).default(15).describe("Max prospects"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
}, async ({ niche, strategy, max_results }) => {
    try {
        const prospects = await findLinkProspects(niche, strategy, max_results);
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        niche,
                        strategy,
                        prospects_found: prospects.length,
                        prospects: prospects.sort((a, b) => b.qualityScore - a.qualityScore),
                    }, null, 2),
                }],
        };
    }
    catch (error) {
        return {
            isError: true,
            content: [{ type: "text", text: `Prospect discovery failed: ${error instanceof Error ? error.message : String(error)}` }],
        };
    }
});
// ─────────────────────────────────────────────
// Tool 4: Find Broken Links on External Site
// ─────────────────────────────────────────────
server.registerTool("monitor_find_broken_links_on_site", {
    title: "Find Broken Links on External Site",
    description: `Crawl an external site to find broken links. Useful for broken link building — find 404s on relevant sites and offer your content as a replacement.

Args:
  - url (string): The external site URL to scan
  - max_pages (number): Max pages to crawl on the site (default: 10, max: 30)

Returns: List of broken links found with the page they're on, the broken URL, anchor text, and status code.`,
    inputSchema: {
        url: z.string().url().describe("External site URL to scan"),
        max_pages: z.number().int().min(1).max(30).default(10).describe("Max pages to crawl"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: true },
}, async ({ url, max_pages }) => {
    try {
        const broken = await findBrokenLinksOnSite(url, max_pages);
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        site: url,
                        pages_crawled: max_pages,
                        broken_links_found: broken.length,
                        broken_links: broken.map((b) => ({
                            found_on_page: b.pageUrl,
                            broken_url: b.brokenHref,
                            anchor_text: b.anchorText,
                            status: b.statusCode,
                        })),
                        recommendation: broken.length > 0
                            ? `Found ${broken.length} broken links. Review these to see if your content could replace any. Use the outreach-engine skill to draft emails.`
                            : "No broken links found on the pages crawled.",
                    }, null, 2),
                }],
        };
    }
    catch (error) {
        return {
            isError: true,
            content: [{ type: "text", text: `Broken link scan failed: ${error instanceof Error ? error.message : String(error)}` }],
        };
    }
});
// ─────────────────────────────────────────────
// Tool 5: Check Backlinks (via SERP analysis)
// ─────────────────────────────────────────────
server.registerTool("monitor_check_backlinks", {
    title: "Check Backlink Profile",
    description: `Analyze the backlink profile of a domain by searching for linking pages. This provides an estimate — for comprehensive data, a dedicated backlink API (Ahrefs, Moz) is recommended.

Args:
  - domain (string): Domain to check backlinks for (e.g., "example.com")
  - max_results (number): Max referring pages to find (default: 20)

Returns: List of pages linking to the domain with their anchor text and source domain.`,
    inputSchema: {
        domain: z.string().min(3).describe("Domain to check"),
        max_results: z.number().int().min(5).max(50).default(20).describe("Max results"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
}, async ({ domain, max_results }) => {
    try {
        const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
        // Search for pages linking to this domain
        const queries = [
            `link:${cleanDomain}`,
            `"${cleanDomain}" -site:${cleanDomain}`,
            `inurl:${cleanDomain} -site:${cleanDomain}`,
        ];
        const referrers = new Map();
        for (const query of queries) {
            if (referrers.size >= max_results)
                break;
            try {
                const serpApiKey = process.env.SERP_API_KEY;
                let html;
                if (serpApiKey) {
                    const apiUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${serpApiKey}&num=20`;
                    const res = await fetch(apiUrl);
                    const data = (await res.json());
                    const organic = (data.organic_results || []);
                    for (const r of organic) {
                        const refDomain = new URL(r.link).hostname;
                        if (!refDomain.includes(cleanDomain) && !referrers.has(r.link)) {
                            referrers.set(r.link, { url: r.link, title: r.title, domain: refDomain });
                        }
                    }
                    html = "";
                }
                else {
                    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=20`;
                    const fetched = await fetchUrl(googleUrl);
                    html = fetched.html;
                    const $ = cheerio.load(html);
                    $(".g a, .tF2Cxc a").each((_, el) => {
                        const href = $(el).attr("href") || "";
                        if (!href.startsWith("http"))
                            return;
                        try {
                            const refDomain = new URL(href).hostname;
                            if (!refDomain.includes(cleanDomain) && !referrers.has(href)) {
                                const title = $(el).closest(".g, .tF2Cxc").find("h3").first().text().trim();
                                referrers.set(href, { url: href, title, domain: refDomain });
                            }
                        }
                        catch { /* skip */ }
                    });
                }
                await new Promise((r) => setTimeout(r, MONITOR_CONSTANTS.CRAWL_DELAY_MS));
            }
            catch {
                // Skip failed queries
            }
        }
        const referrerList = [...referrers.values()].slice(0, max_results);
        // Count unique domains
        const uniqueDomains = new Set(referrerList.map((r) => r.domain));
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        domain: cleanDomain,
                        method: "serp_analysis",
                        note: "This is an estimate via search. For comprehensive backlink data, use a dedicated API like Ahrefs or Moz.",
                        estimated_referring_domains: uniqueDomains.size,
                        referring_pages_found: referrerList.length,
                        referrers: referrerList,
                    }, null, 2),
                }],
        };
    }
    catch (error) {
        return {
            isError: true,
            content: [{ type: "text", text: `Backlink check failed: ${error instanceof Error ? error.message : String(error)}` }],
        };
    }
});
async function fetchUrl(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), MONITOR_CONSTANTS.REQUEST_TIMEOUT_MS);
    try {
        const res = await fetch(url, {
            signal: controller.signal,
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; SEO-Monitor-Bot/1.0)",
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
// Tool 6: Generate Outreach Emails
// ─────────────────────────────────────────────
server.registerTool("monitor_draft_outreach_email", {
    title: "Draft Outreach Email",
    description: `Generate a personalized link building outreach email for a specific prospect.

Args:
  - prospect_url (string): The prospect's website URL
  - prospect_name (string): Contact name (if known)
  - strategy (string): The outreach strategy being used
  - your_url (string): Your content URL to promote
  - your_name (string): Your name/brand for the signature
  - context (string): Any additional context (e.g., specific article you liked, broken link found)

Returns: A personalized email with subject line, body, and follow-up draft.`,
    inputSchema: {
        prospect_url: z.string().url().describe("Prospect's website URL"),
        prospect_name: z.string().default("").describe("Contact name if known"),
        strategy: z.enum(["guest_post", "broken_link", "resource", "skyscraper"]).describe("Outreach strategy"),
        your_url: z.string().url().describe("Your content URL"),
        your_name: z.string().describe("Your name or brand"),
        context: z.string().default("").describe("Additional context"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
}, async ({ prospect_url, prospect_name, strategy, your_url, your_name, context }) => {
    try {
        // Fetch prospect site for personalization data
        let siteTitle = "";
        let recentArticle = "";
        try {
            const { html } = await fetchUrl(prospect_url);
            const $ = cheerio.load(html);
            siteTitle = $("title").first().text().trim() || new URL(prospect_url).hostname;
            // Try to find a recent article title for personalization
            const articleLink = $("article h2 a, .post-title a, h2 a").first();
            recentArticle = articleLink.text().trim() || "";
        }
        catch {
            siteTitle = new URL(prospect_url).hostname;
        }
        const greeting = prospect_name ? `Hi ${prospect_name}` : "Hi there";
        const domain = new URL(prospect_url).hostname;
        let subject = "";
        let body = "";
        let followUp = "";
        switch (strategy) {
            case "guest_post":
                subject = `Content idea for ${siteTitle.slice(0, 30)}`;
                body = `${greeting},

${recentArticle ? `I came across your article "${recentArticle}" and really appreciated the depth of coverage.` : `I've been following ${siteTitle} and appreciate the quality of your content.`}

I write about related topics and have an idea that I think your readers would find valuable. ${context || "I'd love to pitch a few specific angles if you're open to contributions."}

You can see my work at ${your_url}

Would you be interested in discussing this?

${your_name}`;
                followUp = `${greeting},

Just floating this back up — I know inboxes get busy. Would love to discuss a content collaboration if you're open to it.

No worries at all if not a fit.

${your_name}`;
                break;
            case "broken_link":
                subject = `Broken link on ${domain}`;
                body = `${greeting},

I was reading through your site and noticed a broken link ${context ? `— ${context}` : "on one of your pages that returns a 404"}.

I recently published a comprehensive resource on the same topic that could work as a replacement: ${your_url}

Either way, wanted to flag the broken link. Great site otherwise.

${your_name}`;
                followUp = `${greeting},

Just a quick follow-up on the broken link I mentioned. Happy to help with a replacement resource if it's useful.

${your_name}`;
                break;
            case "resource":
                subject = `Resource suggestion for ${siteTitle.slice(0, 30)}`;
                body = `${greeting},

I came across your resource page and thought my guide might be a good fit for your readers: ${your_url}

${context || "It covers the topic comprehensively and is regularly updated."}

Would you consider adding it to your list?

${your_name}`;
                followUp = `${greeting},

Following up on my suggestion to add ${your_url} to your resources page. Let me know if you need any additional information.

${your_name}`;
                break;
            case "skyscraper":
                subject = `Updated resource on ${context || "your topic"}`;
                body = `${greeting},

I noticed you link to a resource about ${context || "this topic"} from your site. I recently published an updated, more comprehensive version: ${your_url}

It includes fresh data and covers additional aspects that the original doesn't.

Thought it might be worth linking to as an alternative or additional resource for your readers.

${your_name}`;
                followUp = `${greeting},

Just wanted to follow up on the updated resource I shared. Happy to provide more details on what makes it a strong reference for your readers.

${your_name}`;
                break;
        }
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        prospect: { url: prospect_url, domain, name: prospect_name || "Unknown", site_title: siteTitle },
                        strategy,
                        email: { subject, body: body.trim() },
                        follow_up: { subject: `Re: ${subject}`, body: followUp.trim(), send_after_days: 6 },
                        note: "Review and personalize before sending. All emails require explicit user approval.",
                    }, null, 2),
                }],
        };
    }
    catch (error) {
        return {
            isError: true,
            content: [{ type: "text", text: `Email drafting failed: ${error instanceof Error ? error.message : String(error)}` }],
        };
    }
});
// ─────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Monitoring MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map