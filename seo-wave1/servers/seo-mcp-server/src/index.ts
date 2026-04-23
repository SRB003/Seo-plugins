import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  fetchPage,
  parsePageSEO,
  extractCrawlableUrls,
  checkUrl,
  fetchRobotsTxt,
  fetchSitemap,
} from "./services/crawler.js";
import { auditMetaTags, calculateAuditScore, issueSeverity } from "./services/scoring.js";
import { SEO_CONSTANTS, type CrawlResult } from "./types.js";

const server = new McpServer({
  name: "seo-mcp-server",
  version: "1.0.0",
});

// ─────────────────────────────────────────────
// Tool 1: Crawl Site
// ─────────────────────────────────────────────

server.registerTool(
  "seo_crawl_site",
  {
    title: "Crawl Site for SEO Analysis",
    description: `Crawl a website breadth-first and collect SEO data from all discoverable pages.
Returns page URLs, HTTP status codes, response times, redirect targets, internal/external links, and basic meta info.
Use this as the first step in any SEO audit to map the full site structure.

Args:
  - url (string): The homepage URL to start crawling from (e.g., "https://example.com")
  - max_pages (number): Maximum pages to crawl (default: 50, max: 500)

Returns: JSON array of crawled pages with status, response time, link counts, and discovered URLs.`,
    inputSchema: {
      url: z.string().url().describe("Homepage URL to crawl (e.g., https://example.com)"),
      max_pages: z
        .number()
        .int()
        .min(1)
        .max(SEO_CONSTANTS.MAX_CRAWL_PAGES)
        .default(50)
        .describe("Max pages to crawl (default: 50)"),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  async ({ url, max_pages }) => {
    try {
      const baseUrl = new URL(url).origin;
      const visited = new Set<string>();
      const queue: string[] = [url.replace(/\/$/, "").toLowerCase()];
      const results: CrawlResult[] = [];

      while (queue.length > 0 && results.length < max_pages) {
        const currentUrl = queue.shift()!;
        if (visited.has(currentUrl)) continue;
        visited.add(currentUrl);

        try {
          const { status, html, responseTime, redirectTarget } = await fetchPage(currentUrl);
          const seoData = parsePageSEO(currentUrl, html);

          results.push({
            ...seoData,
            status,
            responseTime,
            redirectTarget,
          });

          // Add discovered URLs to queue
          if (status === 200) {
            const newUrls = extractCrawlableUrls(html, baseUrl, currentUrl);
            for (const newUrl of newUrls) {
              if (!visited.has(newUrl) && !queue.includes(newUrl)) {
                queue.push(newUrl);
              }
            }
          }

          // Polite crawl delay
          await new Promise((r) => setTimeout(r, SEO_CONSTANTS.CRAWL_DELAY_MS));
        } catch (err) {
          results.push({
            url: currentUrl,
            status: 0,
            responseTime: 0,
            title: undefined,
            metaDescription: undefined,
            h1Tags: [],
            canonical: undefined,
            robots: undefined,
            internalLinks: [],
            externalLinks: [],
            images: [],
            schemaMarkup: [],
          });
        }
      }

      const summary = {
        total_pages_crawled: results.length,
        pages_remaining_in_queue: queue.length,
        status_breakdown: {
          ok_200: results.filter((r) => r.status === 200).length,
          redirects_3xx: results.filter((r) => r.status >= 300 && r.status < 400).length,
          client_errors_4xx: results.filter((r) => r.status >= 400 && r.status < 500).length,
          server_errors_5xx: results.filter((r) => r.status >= 500).length,
          failed: results.filter((r) => r.status === 0).length,
        },
        avg_response_time_ms: Math.round(results.reduce((s, r) => s + r.responseTime, 0) / results.length),
        pages: results.map((r) => ({
          url: r.url,
          status: r.status,
          responseTime: r.responseTime,
          redirectTarget: r.redirectTarget,
          title: r.title,
          h1Count: r.h1Tags.length,
          internalLinkCount: r.internalLinks.length,
          externalLinkCount: r.externalLinks.length,
          imageCount: r.images.length,
          imagesWithoutAlt: r.images.filter((i) => !i.alt || i.alt.trim() === "").length,
          hasSchema: r.schemaMarkup.length > 0,
        })),
      };

      return {
        content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Crawl failed: ${error instanceof Error ? error.message : String(error)}. Check that the URL is accessible and includes the protocol (https://).`,
          },
        ],
      };
    }
  }
);

// ─────────────────────────────────────────────
// Tool 2: Audit Meta Tags
// ─────────────────────────────────────────────

server.registerTool(
  "seo_audit_meta_tags",
  {
    title: "Audit Page Meta Tags",
    description: `Fetch a page and audit its SEO meta tags: title, description, H1, canonical, OG tags, and robots directives.
Returns structured issues with severity ratings.

Args:
  - url (string): The page URL to audit

Returns: Detailed meta tag audit with issues and recommendations.`,
    inputSchema: {
      url: z.string().url().describe("Page URL to audit"),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  async ({ url }) => {
    try {
      const { status, html } = await fetchPage(url);
      if (status !== 200) {
        return {
          content: [{ type: "text", text: `Page returned HTTP ${status}. Cannot audit meta tags on non-200 pages.` }],
        };
      }

      const seoData: CrawlResult = {
        ...parsePageSEO(url, html),
        status,
        responseTime: 0,
      };

      const audit = auditMetaTags(seoData);
      const totalIssues = [
        ...audit.title.issues,
        ...audit.description.issues,
        ...audit.h1.issues,
        ...audit.canonical.issues,
        ...audit.ogTags.issues,
        ...audit.robotsMeta.issues,
      ];

      const result = {
        url,
        score: totalIssues.length === 0 ? 100 : Math.max(0, 100 - totalIssues.length * 15),
        audit,
        issues_summary: totalIssues.map((issue) => ({
          issue,
          severity: issueSeverity(issue),
        })),
      };

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: "text", text: `Meta audit failed: ${error instanceof Error ? error.message : String(error)}` }],
      };
    }
  }
);

// ─────────────────────────────────────────────
// Tool 3: Audit Images
// ─────────────────────────────────────────────

server.registerTool(
  "seo_audit_images",
  {
    title: "Audit Page Images for SEO",
    description: `Audit all images on a page for SEO issues: missing alt text, missing dimensions, and optimization opportunities.

Args:
  - url (string): The page URL to audit images on

Returns: List of images with their alt text status, dimensions, and issues.`,
    inputSchema: {
      url: z.string().url().describe("Page URL to audit images on"),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  async ({ url }) => {
    try {
      const { html } = await fetchPage(url);
      const { images } = parsePageSEO(url, html);

      const missingAlt = images.filter((i) => !i.alt || i.alt.trim() === "");
      const missingDimensions = images.filter((i) => !i.width || !i.height);

      const result = {
        url,
        total_images: images.length,
        missing_alt_text: missingAlt.length,
        missing_dimensions: missingDimensions.length,
        images: images.map((img) => ({
          src: img.src,
          alt: img.alt,
          has_alt: !!(img.alt && img.alt.trim()),
          width: img.width,
          height: img.height,
          has_dimensions: !!(img.width && img.height),
          issues: [
            ...(!img.alt || img.alt.trim() === "" ? ["Missing alt text"] : []),
            ...(!img.width || !img.height ? ["Missing width/height (may cause CLS)"] : []),
          ],
        })),
      };

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: "text", text: `Image audit failed: ${error instanceof Error ? error.message : String(error)}` }],
      };
    }
  }
);

// ─────────────────────────────────────────────
// Tool 4: Check Links
// ─────────────────────────────────────────────

server.registerTool(
  "seo_check_links",
  {
    title: "Check Page Links",
    description: `Check all internal and external links on a page for broken links (404s, 5xx errors).

Args:
  - url (string): The page URL to check links on
  - check_external (boolean): Whether to also check external links (slower, default: false)

Returns: List of broken links with their status codes.`,
    inputSchema: {
      url: z.string().url().describe("Page URL to check links on"),
      check_external: z.boolean().default(false).describe("Also check external links (slower)"),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  async ({ url, check_external }) => {
    try {
      const { html } = await fetchPage(url);
      const { internalLinks, externalLinks } = parsePageSEO(url, html);

      const brokenInternal: { href: string; status: number }[] = [];
      for (const link of internalLinks.slice(0, 100)) {
        const { status, ok } = await checkUrl(link);
        if (!ok) brokenInternal.push({ href: link, status });
        await new Promise((r) => setTimeout(r, 100));
      }

      const brokenExternal: { href: string; status: number }[] = [];
      if (check_external) {
        for (const link of externalLinks.slice(0, 50)) {
          const { status, ok } = await checkUrl(link);
          if (!ok) brokenExternal.push({ href: link, status });
          await new Promise((r) => setTimeout(r, 100));
        }
      }

      const result = {
        url,
        total_internal_links: internalLinks.length,
        total_external_links: externalLinks.length,
        broken_internal: brokenInternal,
        broken_external: brokenExternal,
        external_checked: check_external,
      };

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: "text", text: `Link check failed: ${error instanceof Error ? error.message : String(error)}` }],
      };
    }
  }
);

// ─────────────────────────────────────────────
// Tool 5: Check Core Web Vitals
// ─────────────────────────────────────────────

server.registerTool(
  "seo_check_core_web_vitals",
  {
    title: "Check Core Web Vitals",
    description: `Check Core Web Vitals (LCP, FID/INP, CLS) for a page using Google PageSpeed Insights API.
Requires GOOGLE_PAGESPEED_API_KEY environment variable.

Args:
  - url (string): The page URL to check
  - strategy (string): "mobile" or "desktop" (default: "mobile")

Returns: Core Web Vitals scores with ratings (good/needs-improvement/poor).`,
    inputSchema: {
      url: z.string().url().describe("Page URL to check"),
      strategy: z.enum(["mobile", "desktop"]).default("mobile").describe("Test strategy"),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  async ({ url, strategy }) => {
    const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;

    if (!apiKey) {
      return {
        content: [
          {
            type: "text",
            text: "GOOGLE_PAGESPEED_API_KEY not set. To use Core Web Vitals checking, set this environment variable with a valid Google PageSpeed Insights API key. You can get one at https://developers.google.com/speed/docs/insights/v5/get-started",
          },
        ],
      };
    }

    try {
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&key=${apiKey}`;
      const response = await fetch(apiUrl);
      const data = (await response.json()) as Record<string, unknown>;

      const lighthouse = data.lighthouseResult as Record<string, unknown> | undefined;
      const audits = lighthouse?.audits as Record<string, { numericValue?: number }> | undefined;

      const lcp = audits?.["largest-contentful-paint"]?.numericValue || 0;
      const cls = audits?.["cumulative-layout-shift"]?.numericValue || 0;
      const fid = audits?.["max-potential-fid"]?.numericValue || 0;

      const rateMetric = (value: number, good: number, poor: number): "good" | "needs-improvement" | "poor" => {
        if (value <= good) return "good";
        if (value <= poor) return "needs-improvement";
        return "poor";
      };

      const result = {
        url,
        strategy,
        lcp: { value: Math.round(lcp), unit: "ms", rating: rateMetric(lcp, SEO_CONSTANTS.LCP_GOOD, SEO_CONSTANTS.LCP_POOR) },
        cls: { value: Math.round(cls * 1000) / 1000, rating: rateMetric(cls, SEO_CONSTANTS.CLS_GOOD, SEO_CONSTANTS.CLS_POOR) },
        fid: { value: Math.round(fid), unit: "ms", rating: rateMetric(fid, SEO_CONSTANTS.FID_GOOD, SEO_CONSTANTS.FID_POOR) },
        overall_performance_score: (lighthouse?.categories as Record<string, { score?: number }> | undefined)?.performance?.score
          ? Math.round(((lighthouse?.categories as Record<string, { score?: number }>).performance.score || 0) * 100)
          : null,
      };

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: "text", text: `Core Web Vitals check failed: ${error instanceof Error ? error.message : String(error)}` }],
      };
    }
  }
);

// ─────────────────────────────────────────────
// Tool 6: Check Schema Markup
// ─────────────────────────────────────────────

server.registerTool(
  "seo_check_schema",
  {
    title: "Check Schema Markup",
    description: `Check a page for structured data (JSON-LD schema markup) and validate it.

Args:
  - url (string): The page URL to check

Returns: Found schema types, validation status, and any errors.`,
    inputSchema: {
      url: z.string().url().describe("Page URL to check schema on"),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  async ({ url }) => {
    try {
      const { html } = await fetchPage(url);
      const { schemaMarkup } = parsePageSEO(url, html);

      const result = {
        url,
        has_schema: schemaMarkup.length > 0,
        schemas_found: schemaMarkup.length,
        schemas: schemaMarkup.map((s) => ({
          type: s.type,
          valid_json: s.valid,
          errors: s.errors,
        })),
        recommendation: schemaMarkup.length === 0 ? "No structured data found. Consider adding JSON-LD schema markup to improve rich snippet eligibility." : undefined,
      };

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: "text", text: `Schema check failed: ${error instanceof Error ? error.message : String(error)}` }],
      };
    }
  }
);

// ─────────────────────────────────────────────
// Tool 7: Check Sitemap & Robots
// ─────────────────────────────────────────────

server.registerTool(
  "seo_check_sitemap",
  {
    title: "Check Sitemap and Robots.txt",
    description: `Check a site's sitemap.xml and robots.txt for SEO issues.

Args:
  - url (string): The site base URL (e.g., "https://example.com")

Returns: Sitemap status, URL count, robots.txt directives, and any issues.`,
    inputSchema: {
      url: z.string().url().describe("Site base URL"),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  async ({ url }) => {
    try {
      const baseUrl = new URL(url).origin;
      const [sitemapUrls, robotsTxt] = await Promise.all([fetchSitemap(baseUrl), fetchRobotsTxt(baseUrl)]);

      const issues: string[] = [];
      if (sitemapUrls.length === 0) issues.push("No sitemap.xml found or it's empty");
      if (!robotsTxt) issues.push("No robots.txt found");

      // Parse robots.txt directives
      const disallowedPaths: string[] = [];
      if (robotsTxt) {
        const lines = robotsTxt.split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.toLowerCase().startsWith("disallow:")) {
            const path = trimmed.substring(9).trim();
            if (path) disallowedPaths.push(path);
          }
        }
      }

      // Check if sitemap is referenced in robots.txt
      if (robotsTxt && !robotsTxt.toLowerCase().includes("sitemap:")) {
        issues.push("Sitemap not referenced in robots.txt");
      }

      const result = {
        base_url: baseUrl,
        sitemap: {
          exists: sitemapUrls.length > 0,
          url_count: sitemapUrls.length,
          sample_urls: sitemapUrls.slice(0, 10),
        },
        robots: {
          exists: !!robotsTxt,
          disallowed_paths: disallowedPaths,
          raw: robotsTxt?.substring(0, 2000) || null,
        },
        issues,
      };

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: "text", text: `Sitemap/robots check failed: ${error instanceof Error ? error.message : String(error)}` }],
      };
    }
  }
);

// ─────────────────────────────────────────────
// Tool 8: Full Audit Score
// ─────────────────────────────────────────────

server.registerTool(
  "seo_full_audit_score",
  {
    title: "Calculate Full SEO Audit Score",
    description: `Crawl a site and calculate a comprehensive SEO audit score across 6 categories.
This is a combined tool that crawls + scores in one operation.

Args:
  - url (string): The site URL to audit
  - max_pages (number): Max pages to crawl (default: 30)

Returns: Scores for crawlability, on-page, performance, content signals, structured data, images, and overall.`,
    inputSchema: {
      url: z.string().url().describe("Site URL to audit"),
      max_pages: z.number().int().min(1).max(200).default(30).describe("Max pages to crawl"),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  async ({ url, max_pages }) => {
    try {
      const baseUrl = new URL(url).origin;
      const visited = new Set<string>();
      const queue: string[] = [url.replace(/\/$/, "").toLowerCase()];
      const results: CrawlResult[] = [];

      while (queue.length > 0 && results.length < max_pages) {
        const currentUrl = queue.shift()!;
        if (visited.has(currentUrl)) continue;
        visited.add(currentUrl);

        try {
          const { status, html, responseTime, redirectTarget } = await fetchPage(currentUrl);
          const seoData = parsePageSEO(currentUrl, html);
          results.push({ ...seoData, status, responseTime, redirectTarget });

          if (status === 200) {
            const newUrls = extractCrawlableUrls(html, baseUrl, currentUrl);
            for (const u of newUrls) {
              if (!visited.has(u) && !queue.includes(u)) queue.push(u);
            }
          }
          await new Promise((r) => setTimeout(r, SEO_CONSTANTS.CRAWL_DELAY_MS));
        } catch {
          results.push({
            url: currentUrl,
            status: 0,
            responseTime: 0,
            title: undefined,
            metaDescription: undefined,
            h1Tags: [],
            canonical: undefined,
            robots: undefined,
            internalLinks: [],
            externalLinks: [],
            images: [],
            schemaMarkup: [],
          });
        }
      }

      const scores = calculateAuditScore(results);

      // Collect all issues
      const allIssues: { page: string; issue: string; severity: string }[] = [];
      for (const page of results) {
        const meta = auditMetaTags(page);
        const pageIssues = [
          ...meta.title.issues,
          ...meta.description.issues,
          ...meta.h1.issues,
          ...meta.canonical.issues,
          ...meta.robotsMeta.issues,
        ];
        for (const issue of pageIssues) {
          allIssues.push({ page: page.url, issue, severity: issueSeverity(issue) });
        }
        // Image issues
        for (const img of page.images) {
          if (!img.alt || img.alt.trim() === "") {
            allIssues.push({ page: page.url, issue: `Missing alt text: ${img.src}`, severity: "important" });
          }
        }
      }

      const result = {
        site: baseUrl,
        pages_crawled: results.length,
        scores,
        issue_counts: {
          critical: allIssues.filter((i) => i.severity === "critical").length,
          important: allIssues.filter((i) => i.severity === "important").length,
          nice_to_have: allIssues.filter((i) => i.severity === "nice-to-have").length,
        },
        top_issues: allIssues.filter((i) => i.severity === "critical").slice(0, 20),
        all_issues: allIssues,
      };

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: "text", text: `Full audit failed: ${error instanceof Error ? error.message : String(error)}` }],
      };
    }
  }
);

// ─────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("SEO MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
