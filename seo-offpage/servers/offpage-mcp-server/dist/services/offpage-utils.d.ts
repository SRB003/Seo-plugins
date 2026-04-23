import { type ReferrerEntry, type ToxicLink, type AnchorTextEntry, type UnlinkedMention, type LinkIntersection } from "../types.js";
export declare function discoverBacklinks(domain: string, serpApiKey?: string, maxResults?: number): Promise<ReferrerEntry[]>;
export declare function assessToxicity(referrers: ReferrerEntry[]): ToxicLink[];
export declare function analyzeAnchorText(referrers: ReferrerEntry[], brandName: string): AnchorTextEntry[];
export declare function findUnlinkedMentions(brandName: string, domain: string, serpApiKey?: string, maxResults?: number): Promise<UnlinkedMention[]>;
export declare function findLinkIntersections(yourDomain: string, competitorDomains: string[], serpApiKey?: string, maxResults?: number): Promise<LinkIntersection[]>;
export declare function findCompetitorTopContent(competitorDomain: string, serpApiKey?: string, maxResults?: number): Promise<Array<{
    url: string;
    title: string;
    estimatedBacklinks: number;
    topReferrers: string[];
}>>;
export declare function generateDisavowFile(toxicLinks: ToxicLink[]): string;
export declare function discoverPROpportunities(niche: string, brandName: string, serpApiKey?: string): Promise<Array<{
    type: string;
    topic: string;
    angle: string;
    source: string;
}>>;
//# sourceMappingURL=offpage-utils.d.ts.map