export interface BacklinkAuditResult {
    domain: string;
    totalBacklinks: number;
    referringDomains: number;
    dofollowRatio: number;
    anchorTextDistribution: AnchorTextEntry[];
    topReferrers: ReferrerEntry[];
    toxicLinks: ToxicLink[];
    linkVelocity: LinkVelocityEntry[];
    domainAuthorityEstimate: string;
}
export interface AnchorTextEntry {
    anchor: string;
    count: number;
    percentage: number;
    type: "branded" | "exact_match" | "partial_match" | "generic" | "naked_url" | "other";
}
export interface ReferrerEntry {
    domain: string;
    url: string;
    title: string;
    anchorText: string;
    linkType: "dofollow" | "nofollow" | "ugc" | "sponsored" | "unknown";
    firstSeen: string;
}
export interface ToxicLink {
    url: string;
    domain: string;
    reason: string;
    toxicityScore: number;
    recommendation: "disavow" | "monitor" | "safe";
}
export interface LinkVelocityEntry {
    period: string;
    newLinks: number;
    lostLinks: number;
    netChange: number;
}
export interface CompetitorBacklinkResult {
    yourDomain: string;
    competitorDomain: string;
    yourReferringDomains: number;
    competitorReferringDomains: number;
    linkGap: LinkGapEntry[];
    commonDomains: string[];
    competitorTopContent: CompetitorContentEntry[];
    replicableStrategies: string[];
}
export interface LinkGapEntry {
    domain: string;
    url: string;
    title: string;
    linksToCompetitor: boolean;
    linksToYou: boolean;
    prospectScore: number;
}
export interface CompetitorContentEntry {
    url: string;
    title: string;
    estimatedBacklinks: number;
    topReferrers: string[];
}
export interface UnlinkedMention {
    pageUrl: string;
    pageDomain: string;
    pageTitle: string;
    mentionContext: string;
    hasLink: boolean;
    prospectScore: number;
    contactHint: string;
}
export interface LinkIntersection {
    domain: string;
    url: string;
    title: string;
    linksToCompetitors: string[];
    missingYourDomain: boolean;
    prospectScore: number;
    pitchAngle: string;
}
export interface PROpportunity {
    type: "data_story" | "newsjack" | "expert_commentary" | "trend_piece" | "haro_query";
    topic: string;
    angle: string;
    targetOutlets: string[];
    timeliness: "evergreen" | "time_sensitive" | "breaking";
    pitchDraft: string;
}
export declare const OFFPAGE_CONSTANTS: {
    readonly REQUEST_TIMEOUT_MS: 15000;
    readonly CRAWL_DELAY_MS: 300;
    readonly MAX_BACKLINKS_PER_SCAN: 100;
    readonly MAX_COMPETITORS: 5;
    readonly TOXIC_SCORE_THRESHOLD: 70;
    readonly MIN_PROSPECT_SCORE: 30;
    readonly MAX_MENTIONS_PER_SEARCH: 50;
    readonly MAX_INTERSECTIONS: 50;
};
//# sourceMappingURL=types.d.ts.map