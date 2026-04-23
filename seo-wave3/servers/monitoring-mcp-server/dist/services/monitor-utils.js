import * as cheerio from "cheerio";
import { MONITOR_CONSTANTS, } from "../types.js";
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
/**
 * Check ranking position for a keyword via SERP API or direct scraping
 */
export async function checkRanking(keyword, targetDomain, serpApiKey) {
    const serpFeatures = [];
    const topCompetitors = [];
    if (serpApiKey) {
        const apiUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(keyword)}&api_key=${serpApiKey}&num=30`;
        const res = await fetch(apiUrl);
        const data = (await res.json());
        const organic = (data.organic_results || []);
        // Check SERP features
        if (data.answer_box)
            serpFeatures.push("featured_snippet");
        if (data.knowledge_graph)
            serpFeatures.push("knowledge_panel");
        if (data.local_results)
            serpFeatures.push("local_pack");
        if (data.shopping_results)
            serpFeatures.push("shopping");
        if (data.related_questions?.length)
            serpFeatures.push("people_also_ask");
        // Find our position
        const targetNormalized = targetDomain.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
        let position = null;
        let rankingUrl = null;
        for (const result of organic) {
            const resultDomain = new URL(result.link).hostname.replace(/^www\./, "");
            if (resultDomain.includes(targetNormalized) || targetNormalized.includes(resultDomain)) {
                position = result.position;
                rankingUrl = result.link;
                break;
            }
            if (result.position <= 5) {
                topCompetitors.push({ position: result.position, url: result.link, title: result.title });
            }
        }
        return { keyword, position, rankingUrl, serpFeatures, topCompetitors };
    }
    // Fallback: direct Google scraping
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(keyword)}&num=30`;
    const { html } = await fetchUrl(googleUrl);
    const $ = cheerio.load(html);
    const targetNormalized = targetDomain.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
    let position = null;
    let rankingUrl = null;
    let pos = 0;
    $(".g a, .tF2Cxc a").each((_, el) => {
        const href = $(el).attr("href") || "";
        if (!href.startsWith("http"))
            return;
        pos++;
        try {
            const domain = new URL(href).hostname.replace(/^www\./, "");
            if ((domain.includes(targetNormalized) || targetNormalized.includes(domain)) && !position) {
                position = pos;
                rankingUrl = href;
            }
            if (pos <= 5 && !domain.includes(targetNormalized)) {
                const title = $(el).closest(".g, .tF2Cxc").find("h3").first().text().trim();
                topCompetitors.push({ position: pos, url: href, title });
            }
        }
        catch { /* skip */ }
    });
    return { keyword, position, rankingUrl, serpFeatures, topCompetitors };
}
/**
 * Check for recent Google algorithm updates by scraping known tracking sources
 */
export async function checkAlgorithmUpdates(daysBack = 30) {
    const updates = [];
    // Search for recent confirmed updates
    const searchQueries = [
        "google algorithm update confirmed " + new Date().getFullYear(),
        "google core update " + new Date().toISOString().slice(0, 7),
    ];
    for (const query of searchQueries) {
        try {
            const { html } = await fetchUrl(`https://www.google.com/search?q=${encodeURIComponent(query)}&num=5`);
            const $ = cheerio.load(html);
            $(".g, .tF2Cxc").each((_, el) => {
                const title = $(el).find("h3").first().text().trim();
                const desc = $(el).find(".VwiC3b, .IsZvec").first().text().trim();
                const url = $(el).find("a").first().attr("href") || "";
                if (title &&
                    (title.toLowerCase().includes("update") || title.toLowerCase().includes("algorithm")) &&
                    url.startsWith("http")) {
                    // Extract date from description if possible
                    const dateMatch = desc.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s+\d{1,2},?\s*\d{4}/i);
                    updates.push({
                        name: title.slice(0, 100),
                        date: dateMatch ? dateMatch[0] : "Date unknown",
                        confirmed: title.toLowerCase().includes("confirmed") || desc.toLowerCase().includes("confirmed"),
                        description: desc.slice(0, 300),
                        targetAreas: extractUpdateTargets(title + " " + desc),
                        source: url,
                    });
                }
            });
            await new Promise((r) => setTimeout(r, MONITOR_CONSTANTS.CRAWL_DELAY_MS));
        }
        catch {
            // Skip failed queries
        }
    }
    // Deduplicate by name similarity
    const unique = updates.filter((u, i) => updates.findIndex((u2) => u2.name.toLowerCase().includes(u.name.toLowerCase().slice(0, 20))) === i);
    return unique.slice(0, 10);
}
function extractUpdateTargets(text) {
    const targets = [];
    const lower = text.toLowerCase();
    if (lower.includes("core"))
        targets.push("core_ranking");
    if (lower.includes("content") || lower.includes("helpful"))
        targets.push("content_quality");
    if (lower.includes("spam") || lower.includes("link"))
        targets.push("spam_links");
    if (lower.includes("local"))
        targets.push("local_search");
    if (lower.includes("product") || lower.includes("review"))
        targets.push("product_reviews");
    if (lower.includes("e-e-a-t") || lower.includes("eeat") || lower.includes("expertise"))
        targets.push("eeat");
    return targets.length > 0 ? targets : ["general"];
}
/**
 * Find link building prospects by searching for relevant sites
 */
export async function findLinkProspects(niche, strategy, maxResults = 20) {
    const prospects = [];
    const searchQueries = [];
    switch (strategy) {
        case "guest_post":
            searchQueries.push(`${niche} "write for us"`, `${niche} "guest post"`, `${niche} "contribute"`, `${niche} "submit article"`);
            break;
        case "resource":
            searchQueries.push(`${niche} resources`, `${niche} useful links`, `best ${niche} websites`, `${niche} directory`);
            break;
        case "broken_link":
            searchQueries.push(`${niche} resources links`, `${niche} recommended sites`, `${niche} blogroll`);
            break;
        case "skyscraper":
            searchQueries.push(`${niche} ultimate guide`, `${niche} complete guide`, `${niche} comprehensive`);
            break;
    }
    for (const query of searchQueries) {
        if (prospects.length >= maxResults)
            break;
        try {
            const { html } = await fetchUrl(`https://www.google.com/search?q=${encodeURIComponent(query)}&num=10`);
            const $ = cheerio.load(html);
            $(".g a, .tF2Cxc a").each((_, el) => {
                if (prospects.length >= maxResults)
                    return;
                const href = $(el).attr("href") || "";
                if (!href.startsWith("http"))
                    return;
                const title = $(el).closest(".g, .tF2Cxc").find("h3").first().text().trim();
                if (!title)
                    return;
                try {
                    const domain = new URL(href).hostname;
                    // Skip if already in list
                    if (prospects.some((p) => p.domain === domain))
                        return;
                    // Basic quality signals
                    const relevanceSignals = [];
                    if (title.toLowerCase().includes(niche.toLowerCase()))
                        relevanceSignals.push("niche_in_title");
                    if (strategy === "guest_post" && /write for us|guest post|contribute/i.test(title)) {
                        relevanceSignals.push("accepts_contributions");
                    }
                    prospects.push({
                        url: href,
                        domain,
                        title,
                        relevanceSignals,
                        contactPage: null,
                        qualityScore: Math.min(100, 50 + relevanceSignals.length * 20),
                        strategy,
                    });
                }
                catch { /* skip */ }
            });
            await new Promise((r) => setTimeout(r, MONITOR_CONSTANTS.CRAWL_DELAY_MS));
        }
        catch {
            // Skip failed queries
        }
    }
    return prospects;
}
/**
 * Find broken links on an external site (for broken link building)
 */
export async function findBrokenLinksOnSite(siteUrl, maxPages = 10) {
    const broken = [];
    const baseUrl = new URL(siteUrl).origin;
    const visited = new Set();
    const queue = [siteUrl.replace(/\/$/, "").toLowerCase()];
    while (queue.length > 0 && visited.size < maxPages) {
        const currentUrl = queue.shift();
        if (visited.has(currentUrl))
            continue;
        visited.add(currentUrl);
        try {
            const { html } = await fetchUrl(currentUrl);
            const $ = cheerio.load(html);
            const linksToCheck = [];
            $("a[href]").each((_, el) => {
                const href = $(el).attr("href");
                if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:"))
                    return;
                try {
                    const resolved = new URL(href, currentUrl).href;
                    const anchor = $(el).text().trim().slice(0, 100);
                    linksToCheck.push({ href: resolved, anchor });
                    // Add same-domain links to crawl queue
                    if (resolved.startsWith(baseUrl) && !visited.has(resolved.replace(/\/$/, "").toLowerCase())) {
                        queue.push(resolved.replace(/\/$/, "").toLowerCase());
                    }
                }
                catch { /* skip */ }
            });
            // Check a sample of links for broken ones
            for (const link of linksToCheck.slice(0, 30)) {
                try {
                    const controller = new AbortController();
                    const timeout = setTimeout(() => controller.abort(), 5000);
                    const res = await fetch(link.href, { method: "HEAD", signal: controller.signal, redirect: "follow" });
                    clearTimeout(timeout);
                    if (res.status >= 400) {
                        broken.push({
                            pageUrl: currentUrl,
                            brokenHref: link.href,
                            anchorText: link.anchor,
                            statusCode: res.status,
                        });
                    }
                }
                catch {
                    // Timeout or network error — likely broken
                    broken.push({
                        pageUrl: currentUrl,
                        brokenHref: link.href,
                        anchorText: link.anchor,
                        statusCode: 0,
                    });
                }
                await new Promise((r) => setTimeout(r, 100));
            }
            await new Promise((r) => setTimeout(r, MONITOR_CONSTANTS.CRAWL_DELAY_MS));
        }
        catch {
            // Skip failed pages
        }
    }
    return broken;
}
//# sourceMappingURL=monitor-utils.js.map