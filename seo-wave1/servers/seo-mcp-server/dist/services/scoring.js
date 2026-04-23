import { SEO_CONSTANTS } from "../types.js";
/**
 * Audit meta tags for a single page and return structured issues
 */
export function auditMetaTags(page) {
    const titleIssues = [];
    const descIssues = [];
    const h1Issues = [];
    const canonicalIssues = [];
    const ogIssues = [];
    const robotsIssues = [];
    // Title checks
    if (!page.title) {
        titleIssues.push("Missing title tag");
    }
    else {
        if (page.title.length < SEO_CONSTANTS.TITLE_MIN_LENGTH)
            titleIssues.push(`Too short (${page.title.length} chars, min ${SEO_CONSTANTS.TITLE_MIN_LENGTH})`);
        if (page.title.length > SEO_CONSTANTS.TITLE_MAX_LENGTH)
            titleIssues.push(`Too long (${page.title.length} chars, max ${SEO_CONSTANTS.TITLE_MAX_LENGTH})`);
    }
    // Description checks
    if (!page.metaDescription) {
        descIssues.push("Missing meta description");
    }
    else {
        if (page.metaDescription.length < SEO_CONSTANTS.DESCRIPTION_MIN_LENGTH)
            descIssues.push(`Too short (${page.metaDescription.length} chars, min ${SEO_CONSTANTS.DESCRIPTION_MIN_LENGTH})`);
        if (page.metaDescription.length > SEO_CONSTANTS.DESCRIPTION_MAX_LENGTH)
            descIssues.push(`Too long (${page.metaDescription.length} chars, max ${SEO_CONSTANTS.DESCRIPTION_MAX_LENGTH})`);
    }
    // H1 checks
    if (page.h1Tags.length === 0) {
        h1Issues.push("Missing H1 tag");
    }
    else if (page.h1Tags.length > 1) {
        h1Issues.push(`Multiple H1 tags found (${page.h1Tags.length})`);
    }
    // Canonical checks
    if (!page.canonical) {
        canonicalIssues.push("Missing canonical URL");
    }
    // Robots meta checks
    if (page.robots) {
        if (page.robots.includes("noindex"))
            robotsIssues.push("Page is set to noindex");
        if (page.robots.includes("nofollow"))
            robotsIssues.push("Page is set to nofollow");
    }
    return {
        url: page.url,
        title: { value: page.title || null, length: page.title?.length || 0, issues: titleIssues },
        description: { value: page.metaDescription || null, length: page.metaDescription?.length || 0, issues: descIssues },
        h1: { values: page.h1Tags, issues: h1Issues },
        canonical: { value: page.canonical || null, issues: canonicalIssues },
        ogTags: { title: null, description: null, image: null, issues: ogIssues },
        robotsMeta: { value: page.robots || null, issues: robotsIssues },
    };
}
/**
 * Calculate overall SEO score from crawl results
 */
export function calculateAuditScore(pages) {
    if (pages.length === 0) {
        return { crawlability: 0, onPage: 0, performance: 0, contentSignals: 0, structuredData: 0, images: 0, overall: 0 };
    }
    // Crawlability: % of pages with 200 status, no redirect chains
    const goodStatus = pages.filter((p) => p.status === 200).length;
    const crawlability = Math.round((goodStatus / pages.length) * 100);
    // On-Page: % of pages with title + description + single H1 + canonical
    const goodOnPage = pages.filter((p) => {
        const hasTitle = !!p.title && p.title.length >= SEO_CONSTANTS.TITLE_MIN_LENGTH && p.title.length <= SEO_CONSTANTS.TITLE_MAX_LENGTH;
        const hasDesc = !!p.metaDescription && p.metaDescription.length >= SEO_CONSTANTS.DESCRIPTION_MIN_LENGTH;
        const hasH1 = p.h1Tags.length === 1;
        const hasCanonical = !!p.canonical;
        return hasTitle && hasDesc && hasH1 && hasCanonical;
    }).length;
    const onPage = Math.round((goodOnPage / pages.length) * 100);
    // Performance: placeholder (requires PageSpeed API)
    const performance = 50; // Default until Core Web Vitals data available
    // Content Signals: avg internal links per page
    const avgInternalLinks = pages.reduce((sum, p) => sum + p.internalLinks.length, 0) / pages.length;
    const contentSignals = Math.min(100, Math.round((avgInternalLinks / 10) * 100));
    // Structured Data: % of pages with valid schema
    const hasSchema = pages.filter((p) => p.schemaMarkup.length > 0 && p.schemaMarkup.some((s) => s.valid)).length;
    const structuredData = Math.round((hasSchema / pages.length) * 100);
    // Images: % of images with alt text
    const allImages = pages.flatMap((p) => p.images);
    const imagesWithAlt = allImages.filter((img) => img.alt && img.alt.trim().length > 0).length;
    const imageScore = allImages.length > 0 ? Math.round((imagesWithAlt / allImages.length) * 100) : 100;
    // Weighted overall
    const overall = Math.round(crawlability * 0.25 + onPage * 0.25 + performance * 0.2 + contentSignals * 0.15 + structuredData * 0.1 + imageScore * 0.05);
    return {
        crawlability,
        onPage,
        performance,
        contentSignals,
        structuredData,
        images: imageScore,
        overall,
    };
}
/**
 * Categorize an issue by severity
 */
export function issueSeverity(issue) {
    const critical = ["Missing title", "noindex", "404", "500", "Missing H1", "Multiple H1"];
    const important = ["Too short", "Too long", "Missing meta description", "Missing canonical", "Missing alt"];
    if (critical.some((c) => issue.includes(c)))
        return "critical";
    if (important.some((i) => issue.includes(i)))
        return "important";
    return "nice-to-have";
}
//# sourceMappingURL=scoring.js.map