export interface RankingResult {
  keyword: string;
  position: number | null;
  rankingUrl: string | null;
  serpFeatures: string[];
  topCompetitors: { position: number; url: string; title: string }[];
}

export interface BacklinkProfile {
  domain: string;
  referringDomains: number;
  totalBacklinks: number;
  topReferrers: { domain: string; links: number; anchorTexts: string[] }[];
  anchorTextDistribution: { anchor: string; count: number }[];
}

export interface AlgorithmUpdate {
  name: string;
  date: string;
  confirmed: boolean;
  description: string;
  targetAreas: string[];
  source: string;
}

export interface LinkProspect {
  url: string;
  domain: string;
  title: string;
  relevanceSignals: string[];
  contactPage: string | null;
  qualityScore: number;
  strategy: "guest_post" | "broken_link" | "resource" | "skyscraper";
}

export interface BrokenLinkOnSite {
  pageUrl: string;
  brokenHref: string;
  anchorText: string;
  statusCode: number;
}

export interface AnomalyRecord {
  type: "ranking_drop" | "crawl_error" | "cwv_degradation" | "backlink_anomaly" | "index_change";
  severity: "critical" | "warning" | "info";
  description: string;
  affectedKeywords: string[];
  affectedUrls: string[];
  probableCause: string;
  confidence: "high" | "medium" | "low";
  recommendedActions: string[];
}

export const MONITOR_CONSTANTS = {
  REQUEST_TIMEOUT_MS: 15000,
  CRAWL_DELAY_MS: 300,
  MAX_SERP_PAGES: 3,
  POSITIONS_PER_PAGE: 10,
  MAX_RANK_POSITION: 30,
  SIGNIFICANT_DROP_THRESHOLD: 5,
  SIMULTANEOUS_DROP_THRESHOLD: 3,
  MAX_PROSPECTS_PER_SEARCH: 20,
  MAX_FOLLOW_UPS: 2,
} as const;
