import * as cheerio from "cheerio";
import { SEO_CONSTANTS } from "../types.js";
/**
 * Fetch a URL with timeout and return response info
 */
export async function fetchPage(url) {
    const start = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SEO_CONSTANTS.REQUEST_TIMEOUT_MS);
    try {
        const response = await fetch(url, {
            signal: controller.signal,
            redirect: "follow",
            headers: {
                "User-Agent": "SEO-Audit-Bot/1.0 (Claude Code Plugin)",
                Accept: "text/html,application/xhtml+xml",
            },
        });
        const html = await response.text();
        const responseTime = Date.now() - start;
        return {
            status: response.status,
            html,
            responseTime,
            redirectTarget: response.redirected ? response.url : undefined,
            headers: Object.fromEntries(response.headers.entries()),
        };
    }
    finally {
        clearTimeout(timeout);
    }
}
/**
 * Parse HTML and extract SEO-relevant elements
 */
export function parsePageSEO(url, html) {
    const $ = cheerio.load(html);
    const baseUrl = new URL(url).origin;
    // Extract title
    const title = $("title").first().text().trim() || undefined;
    // Extract meta description
    const metaDescription = $('meta[name="description"]').attr("content")?.trim() || undefined;
    // Extract H1 tags
    const h1Tags = [];
    $("h1").each((_, el) => {
        const text = $(el).text().trim();
        if (text)
            h1Tags.push(text);
    });
    // Extract canonical
    const canonical = $('link[rel="canonical"]').attr("href") || undefined;
    // Extract robots meta
    const robots = $('meta[name="robots"]').attr("content") || undefined;
    // Extract internal and external links
    const internalLinks = [];
    const externalLinks = [];
    $("a[href]").each((_, el) => {
        const href = $(el).attr("href");
        if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:"))
            return;
        try {
            const resolved = new URL(href, url).href;
            if (resolved.startsWith(baseUrl)) {
                internalLinks.push(resolved);
            }
            else {
                externalLinks.push(resolved);
            }
        }
        catch {
            // Invalid URL, skip
        }
    });
    // Extract images
    const images = [];
    $("img").each((_, el) => {
        const src = $(el).attr("src") || $(el).attr("data-src") || "";
        images.push({
            src: src ? new URL(src, url).href : "",
            alt: $(el).attr("alt") ?? null,
            width: $(el).attr("width") ?? null,
            height: $(el).attr("height") ?? null,
        });
    });
    // Extract schema markup (JSON-LD)
    const schemaMarkup = [];
    $('script[type="application/ld+json"]').each((_, el) => {
        const raw = $(el).html() || "";
        try {
            const parsed = JSON.parse(raw);
            schemaMarkup.push({
                type: parsed["@type"] || "Unknown",
                valid: true,
                errors: [],
                raw,
            });
        }
        catch (e) {
            schemaMarkup.push({
                type: "Invalid",
                valid: false,
                errors: [`JSON parse error: ${e instanceof Error ? e.message : String(e)}`],
                raw,
            });
        }
    });
    return {
        url,
        title,
        metaDescription,
        h1Tags,
        canonical,
        robots,
        internalLinks: [...new Set(internalLinks)],
        externalLinks: [...new Set(externalLinks)],
        images,
        schemaMarkup,
    };
}
/**
 * Extract all linkable URLs from a page for crawling
 */
export function extractCrawlableUrls(html, baseUrl, currentUrl) {
    const $ = cheerio.load(html);
    const urls = new Set();
    $("a[href]").each((_, el) => {
        const href = $(el).attr("href");
        if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:"))
            return;
        try {
            const resolved = new URL(href, currentUrl).href;
            // Only follow same-origin links
            if (resolved.startsWith(baseUrl) && !resolved.includes("#")) {
                // Normalize: remove trailing slash, lowercase
                const normalized = resolved.replace(/\/$/, "").toLowerCase();
                urls.add(normalized);
            }
        }
        catch {
            // Invalid URL, skip
        }
    });
    return [...urls];
}
/**
 * Check if a URL returns a valid response
 */
export async function checkUrl(url) {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), SEO_CONSTANTS.REQUEST_TIMEOUT_MS);
        const response = await fetch(url, {
            method: "HEAD",
            signal: controller.signal,
            redirect: "follow",
        });
        clearTimeout(timeout);
        return { status: response.status, ok: response.ok };
    }
    catch {
        return { status: 0, ok: false };
    }
}
/**
 * Fetch robots.txt for a domain
 */
export async function fetchRobotsTxt(baseUrl) {
    try {
        const response = await fetch(`${baseUrl}/robots.txt`);
        if (response.ok)
            return await response.text();
        return null;
    }
    catch {
        return null;
    }
}
/**
 * Fetch and parse sitemap.xml
 */
export async function fetchSitemap(baseUrl) {
    try {
        const response = await fetch(`${baseUrl}/sitemap.xml`);
        if (!response.ok)
            return [];
        const xml = await response.text();
        const $ = cheerio.load(xml, { xml: true });
        const urls = [];
        $("loc").each((_, el) => {
            const loc = $(el).text().trim();
            if (loc)
                urls.push(loc);
        });
        return urls;
    }
    catch {
        return [];
    }
}
//# sourceMappingURL=crawler.js.map