import { type RankingResult, type AlgorithmUpdate, type LinkProspect, type BrokenLinkOnSite } from "../types.js";
/**
 * Check ranking position for a keyword via SERP API or direct scraping
 */
export declare function checkRanking(keyword: string, targetDomain: string, serpApiKey?: string): Promise<RankingResult>;
/**
 * Check for recent Google algorithm updates by scraping known tracking sources
 */
export declare function checkAlgorithmUpdates(daysBack?: number): Promise<AlgorithmUpdate[]>;
/**
 * Find link building prospects by searching for relevant sites
 */
export declare function findLinkProspects(niche: string, strategy: LinkProspect["strategy"], maxResults?: number): Promise<LinkProspect[]>;
/**
 * Find broken links on an external site (for broken link building)
 */
export declare function findBrokenLinksOnSite(siteUrl: string, maxPages?: number): Promise<BrokenLinkOnSite[]>;
//# sourceMappingURL=monitor-utils.d.ts.map