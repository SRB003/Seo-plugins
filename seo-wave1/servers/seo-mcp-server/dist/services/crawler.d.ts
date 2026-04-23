import { type CrawlResult } from "../types.js";
/**
 * Fetch a URL with timeout and return response info
 */
export declare function fetchPage(url: string): Promise<{
    status: number;
    html: string;
    responseTime: number;
    redirectTarget?: string;
    headers: Record<string, string>;
}>;
/**
 * Parse HTML and extract SEO-relevant elements
 */
export declare function parsePageSEO(url: string, html: string): Omit<CrawlResult, "status" | "responseTime" | "redirectTarget">;
/**
 * Extract all linkable URLs from a page for crawling
 */
export declare function extractCrawlableUrls(html: string, baseUrl: string, currentUrl: string): string[];
/**
 * Check if a URL returns a valid response
 */
export declare function checkUrl(url: string): Promise<{
    status: number;
    ok: boolean;
}>;
/**
 * Fetch robots.txt for a domain
 */
export declare function fetchRobotsTxt(baseUrl: string): Promise<string | null>;
/**
 * Fetch and parse sitemap.xml
 */
export declare function fetchSitemap(baseUrl: string): Promise<string[]>;
//# sourceMappingURL=crawler.d.ts.map