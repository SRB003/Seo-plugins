import { type AuditScore, type CrawlResult, type MetaAuditResult } from "../types.js";
/**
 * Audit meta tags for a single page and return structured issues
 */
export declare function auditMetaTags(page: CrawlResult): MetaAuditResult;
/**
 * Calculate overall SEO score from crawl results
 */
export declare function calculateAuditScore(pages: CrawlResult[]): AuditScore;
/**
 * Categorize an issue by severity
 */
export declare function issueSeverity(issue: string): "critical" | "important" | "nice-to-have";
//# sourceMappingURL=scoring.d.ts.map