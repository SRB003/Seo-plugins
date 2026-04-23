import * as cheerio from "cheerio";
import { OFFPAGE_CONSTANTS, } from "../types.js";
async function fetchUrl(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), OFFPAGE_CONSTANTS.REQUEST_TIMEOUT_MS);
    try {
        const res = await fetch(url, {
            signal: controller.signal,
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; SEO-Offpage-Bot/1.0)",
                Accept: "text/html,application/xhtml+xml",
            },
        });
        return { html: await res.text(), status: res.status };
    }
    finally {
        clearTimeout(timeout);
    }
}
function normalizeDomain(domain) {
    return domain.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "").toLowerCase();
}
// ─── Backlink Discovery via SERP ───
export async function discoverBacklinks(domain, serpApiKey, maxResults = 50) {
    const cleanDomain = normalizeDomain(domain);
    const referrers = new Map();
    const queries = [
        `"${cleanDomain}" -site:${cleanDomain}`,
        `link:${cleanDomain}`,
        `inurl:${cleanDomain} -site:${cleanDomain}`,
    ];
    for (const query of queries) {
        if (referrers.size >= maxResults)
            break;
        try {
            if (serpApiKey) {
                const apiUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${serpApiKey}&num=20`;
                const res = await fetch(apiUrl);
                const data = (await res.json());
                const organic = (data.organic_results || []);
                for (const r of organic) {
                    try {
                        const refDomain = normalizeDomain(new URL(r.link).hostname);
                        if (!refDomain.includes(cleanDomain) && !referrers.has(r.link)) {
                            referrers.set(r.link, {
                                domain: refDomain,
                                url: r.link,
                                title: r.title,
                                anchorText: extractAnchorFromSnippet(r.snippet, cleanDomain),
                                linkType: "unknown",
                                firstSeen: new Date().toISOString().slice(0, 10),
                            });
                        }
                    }
                    catch { /* skip */ }
                }
            }
            else {
                const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=20`;
                const { html } = await fetchUrl(googleUrl);
                const $ = cheerio.load(html);
                $(".g a, .tF2Cxc a").each((_, el) => {
                    const href = $(el).attr("href") || "";
                    if (!href.startsWith("http"))
                        return;
                    try {
                        const refDomain = normalizeDomain(new URL(href).hostname);
                        if (!refDomain.includes(cleanDomain) && !referrers.has(href)) {
                            const title = $(el).closest(".g, .tF2Cxc").find("h3").first().text().trim();
                            const snippet = $(el).closest(".g, .tF2Cxc").find(".VwiC3b, .IsZvec").first().text().trim();
                            referrers.set(href, {
                                domain: refDomain,
                                url: href,
                                title,
                                anchorText: extractAnchorFromSnippet(snippet, cleanDomain),
                                linkType: "unknown",
                                firstSeen: new Date().toISOString().slice(0, 10),
                            });
                        }
                    }
                    catch { /* skip */ }
                });
            }
            await new Promise((r) => setTimeout(r, OFFPAGE_CONSTANTS.CRAWL_DELAY_MS));
        }
        catch { /* skip */ }
    }
    return [...referrers.values()].slice(0, maxResults);
}
function extractAnchorFromSnippet(snippet, domain) {
    if (snippet.toLowerCase().includes(domain))
        return domain;
    const words = snippet.split(/\s+/).slice(0, 5).join(" ");
    return words || "unknown";
}
// ─── Toxic Link Assessment ───
export function assessToxicity(referrers) {
    const toxic = [];
    const spamPatterns = [
        /free.*link/i, /buy.*link/i, /link.*farm/i, /casino/i, /viagra/i,
        /payday.*loan/i, /cheap.*buy/i, /adult/i, /porn/i, /gambling/i,
        /\.xyz$/i, /\.tk$/i, /\.ml$/i, /\.ga$/i, /\.cf$/i,
    ];
    for (const ref of referrers) {
        let toxicityScore = 0;
        const reasons = [];
        for (const pattern of spamPatterns) {
            if (pattern.test(ref.domain) || pattern.test(ref.url) || pattern.test(ref.title)) {
                toxicityScore += 30;
                reasons.push(`Matches spam pattern: ${pattern.source}`);
            }
        }
        // Check for suspicious TLDs
        if (/\.(xyz|tk|ml|ga|cf|pw|cc|ws)$/i.test(ref.domain)) {
            toxicityScore += 20;
            reasons.push("Suspicious TLD commonly used by spam sites");
        }
        // Check for extremely long domains (often auto-generated)
        if (ref.domain.length > 40) {
            toxicityScore += 15;
            reasons.push("Unusually long domain name");
        }
        // Check for excessive hyphens
        if ((ref.domain.match(/-/g) || []).length > 3) {
            toxicityScore += 15;
            reasons.push("Excessive hyphens in domain");
        }
        if (toxicityScore > 0) {
            toxic.push({
                url: ref.url,
                domain: ref.domain,
                reason: reasons.join("; "),
                toxicityScore: Math.min(100, toxicityScore),
                recommendation: toxicityScore >= OFFPAGE_CONSTANTS.TOXIC_SCORE_THRESHOLD
                    ? "disavow"
                    : toxicityScore >= 40
                        ? "monitor"
                        : "safe",
            });
        }
    }
    return toxic.sort((a, b) => b.toxicityScore - a.toxicityScore);
}
// ─── Anchor Text Analysis ───
export function analyzeAnchorText(referrers, brandName) {
    const anchorCounts = new Map();
    const brandLower = brandName.toLowerCase();
    for (const ref of referrers) {
        const anchor = ref.anchorText.toLowerCase().trim() || "unknown";
        let type = "other";
        if (anchor.includes(brandLower)) {
            type = "branded";
        }
        else if (/^https?:\/\//.test(anchor) || /\.\w{2,4}$/.test(anchor)) {
            type = "naked_url";
        }
        else if (["click here", "here", "read more", "learn more", "visit", "website", "link"].includes(anchor)) {
            type = "generic";
        }
        else if (anchor.split(/\s+/).length <= 4) {
            type = "exact_match";
        }
        else {
            type = "partial_match";
        }
        const existing = anchorCounts.get(anchor);
        if (existing) {
            existing.count++;
        }
        else {
            anchorCounts.set(anchor, { count: 1, type });
        }
    }
    const total = referrers.length || 1;
    return [...anchorCounts.entries()]
        .map(([anchor, data]) => ({
        anchor,
        count: data.count,
        percentage: Math.round((data.count / total) * 100),
        type: data.type,
    }))
        .sort((a, b) => b.count - a.count);
}
// ─── Unlinked Mention Discovery ───
export async function findUnlinkedMentions(brandName, domain, serpApiKey, maxResults = 30) {
    const cleanDomain = normalizeDomain(domain);
    const mentions = [];
    const queries = [
        `"${brandName}" -site:${cleanDomain} -link:${cleanDomain}`,
        `"${brandName}" -site:${cleanDomain}`,
        `"${brandName}" review -site:${cleanDomain}`,
        `"${brandName}" mentioned -site:${cleanDomain}`,
    ];
    for (const query of queries) {
        if (mentions.length >= maxResults)
            break;
        try {
            let results = [];
            if (serpApiKey) {
                const apiUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${serpApiKey}&num=15`;
                const res = await fetch(apiUrl);
                const data = (await res.json());
                const organic = (data.organic_results || []);
                results = organic.map((r) => ({ url: r.link, title: r.title, snippet: r.snippet }));
            }
            else {
                const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=15`;
                const { html } = await fetchUrl(googleUrl);
                const $ = cheerio.load(html);
                $(".g, .tF2Cxc").each((_, el) => {
                    const href = $(el).find("a").first().attr("href") || "";
                    const title = $(el).find("h3").first().text().trim();
                    const snippet = $(el).find(".VwiC3b, .IsZvec").first().text().trim();
                    if (href.startsWith("http") && title) {
                        results.push({ url: href, title, snippet });
                    }
                });
            }
            for (const r of results) {
                try {
                    const pageDomain = normalizeDomain(new URL(r.url).hostname);
                    if (pageDomain.includes(cleanDomain))
                        continue;
                    if (mentions.some((m) => m.pageUrl === r.url))
                        continue;
                    // Check if the page actually links to us
                    let hasLink = false;
                    try {
                        const { html: pageHtml } = await fetchUrl(r.url);
                        const $ = cheerio.load(pageHtml);
                        hasLink = $(`a[href*="${cleanDomain}"]`).length > 0;
                    }
                    catch {
                        // Can't verify — assume no link
                    }
                    if (!hasLink) {
                        const prospectScore = calculateMentionScore(r.title, r.snippet, brandName);
                        mentions.push({
                            pageUrl: r.url,
                            pageDomain,
                            pageTitle: r.title,
                            mentionContext: r.snippet.slice(0, 200),
                            hasLink: false,
                            prospectScore,
                            contactHint: `Look for contact page at ${pageDomain}/contact or ${pageDomain}/about`,
                        });
                    }
                }
                catch { /* skip */ }
                await new Promise((r) => setTimeout(r, 150));
            }
            await new Promise((r) => setTimeout(r, OFFPAGE_CONSTANTS.CRAWL_DELAY_MS));
        }
        catch { /* skip */ }
    }
    return mentions
        .filter((m) => m.prospectScore >= OFFPAGE_CONSTANTS.MIN_PROSPECT_SCORE)
        .sort((a, b) => b.prospectScore - a.prospectScore)
        .slice(0, maxResults);
}
function calculateMentionScore(title, snippet, brandName) {
    let score = 50;
    const lower = (title + " " + snippet).toLowerCase();
    const brand = brandName.toLowerCase();
    // Direct brand mention in title
    if (title.toLowerCase().includes(brand))
        score += 15;
    // Multiple mentions
    const mentionCount = (lower.match(new RegExp(brand, "gi")) || []).length;
    if (mentionCount > 1)
        score += 10;
    // Positive context
    if (/recommend|best|top|review|guide|resource/i.test(lower))
        score += 10;
    // Editorial content (more likely to add a link)
    if (/blog|article|post|guide|review/i.test(lower))
        score += 10;
    // Negative context (less likely to cooperate)
    if (/complaint|scam|avoid|worst/i.test(lower))
        score -= 20;
    return Math.max(0, Math.min(100, score));
}
// ─── Link Intersection Analysis ───
export async function findLinkIntersections(yourDomain, competitorDomains, serpApiKey, maxResults = 30) {
    const cleanYourDomain = normalizeDomain(yourDomain);
    const cleanCompetitors = competitorDomains.map(normalizeDomain);
    const intersections = new Map();
    // For each competitor, find their backlinks
    for (const competitor of cleanCompetitors) {
        const competitorLinks = await discoverBacklinks(competitor, serpApiKey, 30);
        for (const link of competitorLinks) {
            const refDomain = normalizeDomain(link.domain);
            if (refDomain.includes(cleanYourDomain))
                continue;
            if (cleanCompetitors.some((c) => refDomain.includes(c)))
                continue;
            const key = refDomain;
            const existing = intersections.get(key);
            if (existing) {
                if (!existing.linksToCompetitors.includes(competitor)) {
                    existing.linksToCompetitors.push(competitor);
                    existing.prospectScore = Math.min(100, existing.prospectScore + 15);
                }
            }
            else {
                intersections.set(key, {
                    domain: refDomain,
                    url: link.url,
                    title: link.title,
                    linksToCompetitors: [competitor],
                    missingYourDomain: true,
                    prospectScore: 50,
                    pitchAngle: generatePitchAngle(link.title, competitor),
                });
            }
        }
        await new Promise((r) => setTimeout(r, OFFPAGE_CONSTANTS.CRAWL_DELAY_MS));
    }
    // Check if any of these domains also link to us
    const yourLinks = await discoverBacklinks(cleanYourDomain, serpApiKey, 30);
    const yourLinkDomains = new Set(yourLinks.map((l) => normalizeDomain(l.domain)));
    for (const [key, intersection] of intersections) {
        if (yourLinkDomains.has(key)) {
            intersection.missingYourDomain = false;
            intersection.prospectScore -= 30;
        }
    }
    return [...intersections.values()]
        .filter((i) => i.missingYourDomain && i.prospectScore >= OFFPAGE_CONSTANTS.MIN_PROSPECT_SCORE)
        .sort((a, b) => {
        // Sort by number of competitors linking (more = higher priority), then by score
        if (b.linksToCompetitors.length !== a.linksToCompetitors.length) {
            return b.linksToCompetitors.length - a.linksToCompetitors.length;
        }
        return b.prospectScore - a.prospectScore;
    })
        .slice(0, maxResults);
}
function generatePitchAngle(title, competitor) {
    const lower = title.toLowerCase();
    if (/resource|tools|list|directory/i.test(lower)) {
        return `Resource page that lists ${competitor} — suggest adding your site as an additional resource`;
    }
    if (/review|comparison|vs|versus/i.test(lower)) {
        return `Review/comparison content — pitch for inclusion in their next update`;
    }
    if (/guide|how.to|tutorial/i.test(lower)) {
        return `Educational content referencing ${competitor} — offer your content as a complementary reference`;
    }
    if (/blog|article|post/i.test(lower)) {
        return `Editorial content — pitch a guest post or suggest your resource as a relevant link`;
    }
    return `Links to ${competitor} — reach out with your unique value proposition`;
}
// ─── Competitor Top Content by Links ───
export async function findCompetitorTopContent(competitorDomain, serpApiKey, maxResults = 10) {
    const cleanDomain = normalizeDomain(competitorDomain);
    const contentMap = new Map();
    // Search for most linked content on the competitor
    const queries = [
        `site:${cleanDomain} -inurl:tag -inurl:category`,
        `"${cleanDomain}" best guide`,
        `"${cleanDomain}" resource`,
    ];
    for (const query of queries) {
        try {
            if (serpApiKey) {
                const apiUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${serpApiKey}&num=15`;
                const res = await fetch(apiUrl);
                const data = (await res.json());
                const organic = (data.organic_results || []);
                for (const r of organic) {
                    if (!contentMap.has(r.link)) {
                        contentMap.set(r.link, { title: r.title, referrers: new Set() });
                    }
                }
            }
            else {
                const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=15`;
                const { html } = await fetchUrl(googleUrl);
                const $ = cheerio.load(html);
                $(".g a, .tF2Cxc a").each((_, el) => {
                    const href = $(el).attr("href") || "";
                    if (!href.startsWith("http"))
                        return;
                    const title = $(el).closest(".g, .tF2Cxc").find("h3").first().text().trim();
                    if (title && !contentMap.has(href)) {
                        contentMap.set(href, { title, referrers: new Set() });
                    }
                });
            }
            await new Promise((r) => setTimeout(r, OFFPAGE_CONSTANTS.CRAWL_DELAY_MS));
        }
        catch { /* skip */ }
    }
    // For top content, try to find who links to them
    const topContent = [...contentMap.entries()].slice(0, maxResults);
    for (const [url, data] of topContent) {
        try {
            const backlinks = await discoverBacklinks(url, serpApiKey, 5);
            for (const bl of backlinks) {
                data.referrers.add(bl.domain);
            }
        }
        catch { /* skip */ }
        await new Promise((r) => setTimeout(r, OFFPAGE_CONSTANTS.CRAWL_DELAY_MS));
    }
    return topContent
        .map(([url, data]) => ({
        url,
        title: data.title,
        estimatedBacklinks: data.referrers.size,
        topReferrers: [...data.referrers].slice(0, 5),
    }))
        .sort((a, b) => b.estimatedBacklinks - a.estimatedBacklinks);
}
// ─── Disavow File Generator ───
export function generateDisavowFile(toxicLinks) {
    const disavowEntries = toxicLinks
        .filter((t) => t.recommendation === "disavow")
        .map((t) => {
        // Disavow at domain level for highly toxic, URL level otherwise
        if (t.toxicityScore >= 80) {
            return `domain:${t.domain}`;
        }
        return t.url;
    });
    const uniqueEntries = [...new Set(disavowEntries)];
    return [
        "# Google Disavow File",
        `# Generated: ${new Date().toISOString().slice(0, 10)}`,
        `# Total entries: ${uniqueEntries.length}`,
        "# Review each entry before submitting to Google Search Console",
        "",
        ...uniqueEntries,
    ].join("\n");
}
// ─── PR Opportunity Discovery ───
export async function discoverPROpportunities(niche, brandName, serpApiKey) {
    const opportunities = [];
    const queries = [
        `${niche} news ${new Date().getFullYear()}`,
        `${niche} trends ${new Date().getFullYear()}`,
        `${niche} study research data`,
        `${niche} "looking for experts"`,
        `${niche} journalist query source`,
    ];
    for (const query of queries) {
        try {
            let results = [];
            if (serpApiKey) {
                const apiUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${serpApiKey}&num=5&tbs=qdr:m`;
                const res = await fetch(apiUrl);
                const data = (await res.json());
                const organic = (data.organic_results || []);
                results = organic.map((r) => ({ url: r.link, title: r.title, snippet: r.snippet }));
            }
            else {
                const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=5&tbs=qdr:m`;
                const { html } = await fetchUrl(googleUrl);
                const $ = cheerio.load(html);
                $(".g, .tF2Cxc").each((_, el) => {
                    const href = $(el).find("a").first().attr("href") || "";
                    const title = $(el).find("h3").first().text().trim();
                    const snippet = $(el).find(".VwiC3b, .IsZvec").first().text().trim();
                    if (href.startsWith("http") && title) {
                        results.push({ url: href, title, snippet });
                    }
                });
            }
            for (const r of results) {
                let type = "trend_piece";
                if (/study|research|data|survey|report/i.test(r.title))
                    type = "data_story";
                if (/breaking|just|now|today/i.test(r.title))
                    type = "newsjack";
                if (/expert|comment|quote|looking for/i.test(r.title))
                    type = "expert_commentary";
                if (/query|source|journalist/i.test(r.title))
                    type = "haro_query";
                opportunities.push({
                    type,
                    topic: r.title.slice(0, 100),
                    angle: `Position ${brandName} as an authority on this topic with unique data or expert perspective`,
                    source: r.url,
                });
            }
            await new Promise((r) => setTimeout(r, OFFPAGE_CONSTANTS.CRAWL_DELAY_MS));
        }
        catch { /* skip */ }
    }
    return opportunities.slice(0, 15);
}
//# sourceMappingURL=offpage-utils.js.map