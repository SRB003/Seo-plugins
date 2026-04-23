import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  discoverBacklinks,
  assessToxicity,
  analyzeAnchorText,
  findUnlinkedMentions,
  findLinkIntersections,
  findCompetitorTopContent,
  generateDisavowFile,
  discoverPROpportunities,
} from "./services/offpage-utils.js";
import { OFFPAGE_CONSTANTS } from "./types.js";

const server = new McpServer({
  name: "offpage-mcp-server",
  version: "1.0.0",
});

// ─────────────────────────────────────────────
// Tool 1: Audit Backlink Profile
// ─────────────────────────────────────────────

server.registerTool(
  "offpage_audit_backlinks",
  {
    title: "Audit Backlink Profile",
    description: `Analyze a domain's backlink profile including referring domains, anchor text distribution, toxic link detection, and disavow file generation.

Args:
  - domain (string): Domain to audit (e.g., "example.com")
  - brand_name (string): Brand name for anchor text classification
  - max_results (number): Maximum backlinks to analyze (default: 50)

Returns: Backlink profile with referrers, anchor text analysis, toxic links, and disavow recommendations.`,
    inputSchema: {
      domain: z.string().min(3).describe("Domain to audit (e.g., example.com)"),
      brand_name: z.string().min(1).describe("Brand name for anchor text classification"),
      max_results: z.number().int().min(10).max(100).default(50).describe("Max backlinks to analyze"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  async ({ domain, brand_name, max_results }) => {
    try {
      const serpApiKey = process.env.SERP_API_KEY;
      const referrers = await discoverBacklinks(domain, serpApiKey, max_results);
      const toxicLinks = assessToxicity(referrers);
      const anchorAnalysis = analyzeAnchorText(referrers, brand_name);
      const disavowFile = generateDisavowFile(toxicLinks);

      const uniqueDomains = new Set(referrers.map((r) => r.domain));
      const dofollowCount = referrers.filter((r) => r.linkType === "dofollow").length;

      // Anchor text type distribution
      const typeDistribution: Record<string, number> = {};
      for (const a of anchorAnalysis) {
        typeDistribution[a.type] = (typeDistribution[a.type] || 0) + a.count;
      }

      const result = {
        domain,
        method: "serp_analysis",
        note: "Estimates via search. For comprehensive data, use Ahrefs or Moz API.",
        summary: {
          total_backlinks_found: referrers.length,
          referring_domains: uniqueDomains.size,
          dofollow_ratio: referrers.length > 0
            ? `${Math.round((dofollowCount / referrers.length) * 100)}%`
            : "unknown",
          toxic_links: toxicLinks.filter((t) => t.recommendation === "disavow").length,
          links_to_monitor: toxicLinks.filter((t) => t.recommendation === "monitor").length,
        },
        anchor_text_distribution: {
          by_type: typeDistribution,
          top_anchors: anchorAnalysis.slice(0, 15),
          health_check: getAnchorHealthCheck(typeDistribution, referrers.length),
        },
        top_referrers: referrers.slice(0, 20),
        toxic_links: toxicLinks.slice(0, 20),
        disavow_file: toxicLinks.some((t) => t.recommendation === "disavow")
          ? disavowFile
          : "No links flagged for disavow.",
      };

      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: "text", text: `Backlink audit failed: ${error instanceof Error ? error.message : String(error)}` }],
      };
    }
  }
);

function getAnchorHealthCheck(distribution: Record<string, number>, total: number): string {
  if (total === 0) return "No backlinks found to analyze.";
  const brandedPct = ((distribution.branded || 0) / total) * 100;
  const exactPct = ((distribution.exact_match || 0) / total) * 100;

  const issues: string[] = [];
  if (brandedPct < 20) issues.push("Low branded anchor ratio (< 20%) — consider more brand-building");
  if (exactPct > 30) issues.push("High exact-match anchor ratio (> 30%) — risk of over-optimization penalty");
  if (brandedPct > 70) issues.push("Very high branded ratio — may benefit from more topical anchors");

  return issues.length > 0 ? issues.join(". ") : "Anchor text distribution looks healthy.";
}

// ─────────────────────────────────────────────
// Tool 2: Competitor Backlink Analysis
// ─────────────────────────────────────────────

server.registerTool(
  "offpage_competitor_backlinks",
  {
    title: "Analyze Competitor Backlinks",
    description: `Reverse-engineer a competitor's backlink profile to find link gaps, top-performing content by links, and replicable strategies.

Args:
  - your_domain (string): Your domain
  - competitor_domain (string): Competitor domain to analyze
  - max_results (number): Max backlinks per domain (default: 30)

Returns: Link gap analysis, competitor top content, common domains, and replicable strategies.`,
    inputSchema: {
      your_domain: z.string().min(3).describe("Your domain"),
      competitor_domain: z.string().min(3).describe("Competitor domain to analyze"),
      max_results: z.number().int().min(10).max(50).default(30).describe("Max backlinks per domain"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  async ({ your_domain, competitor_domain, max_results }) => {
    try {
      const serpApiKey = process.env.SERP_API_KEY;

      // Discover backlinks for both domains
      const [yourBacklinks, competitorBacklinks] = await Promise.all([
        discoverBacklinks(your_domain, serpApiKey, max_results),
        discoverBacklinks(competitor_domain, serpApiKey, max_results),
      ]);

      const yourDomains = new Set(yourBacklinks.map((r) => r.domain));
      const competitorDomains = new Set(competitorBacklinks.map((r) => r.domain));

      // Link gap: domains linking to competitor but not to you
      const linkGap = competitorBacklinks
        .filter((r) => !yourDomains.has(r.domain))
        .map((r) => ({
          domain: r.domain,
          url: r.url,
          title: r.title,
          linksToCompetitor: true,
          linksToYou: false,
          prospectScore: 60 + (r.title.length > 10 ? 10 : 0),
        }));

      // Common domains
      const common = [...yourDomains].filter((d) => competitorDomains.has(d));

      // Competitor top content
      const topContent = await findCompetitorTopContent(competitor_domain, serpApiKey, 10);

      // Identify replicable strategies
      const strategies: string[] = [];
      if (linkGap.some((l) => /resource|directory|list/i.test(l.title))) {
        strategies.push("Resource page submissions — competitor is listed on curated resource pages");
      }
      if (linkGap.some((l) => /guest|contributed|author/i.test(l.title))) {
        strategies.push("Guest posting — competitor publishes on external sites");
      }
      if (linkGap.some((l) => /review|comparison/i.test(l.title))) {
        strategies.push("Product/service reviews — competitor is featured in review content");
      }
      if (linkGap.some((l) => /news|press|media/i.test(l.title))) {
        strategies.push("Digital PR — competitor earns press/media coverage");
      }
      if (strategies.length === 0) {
        strategies.push("General content marketing — build better content to attract natural links");
      }

      const result = {
        your_domain,
        competitor_domain,
        summary: {
          your_referring_domains: yourDomains.size,
          competitor_referring_domains: competitorDomains.size,
          link_gap_count: linkGap.length,
          common_domains: common.length,
          domain_advantage: competitorDomains.size - yourDomains.size,
        },
        link_gap: linkGap.sort((a, b) => b.prospectScore - a.prospectScore).slice(0, 20),
        common_domains: common.slice(0, 10),
        competitor_top_content: topContent,
        replicable_strategies: strategies,
        recommendation: linkGap.length > 10
          ? `Found ${linkGap.length} link gap opportunities. Prioritize domains with highest prospect scores. Use the outreach-engine to contact them.`
          : `Limited link gap found. Focus on creating better content and using digital PR to earn unique links.`,
      };

      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: "text", text: `Competitor analysis failed: ${error instanceof Error ? error.message : String(error)}` }],
      };
    }
  }
);

// ─────────────────────────────────────────────
// Tool 3: Find Unlinked Mentions
// ─────────────────────────────────────────────

server.registerTool(
  "offpage_find_unlinked_mentions",
  {
    title: "Find Unlinked Brand Mentions",
    description: `Discover pages that mention your brand but don't link to your site. These are high-conversion outreach targets since the author already knows your brand.

Args:
  - brand_name (string): Your brand name to search for
  - domain (string): Your domain (to exclude and verify links)
  - max_results (number): Maximum mentions to find (default: 20)

Returns: List of unlinked mentions with page URL, context, prospect score, and contact hints.`,
    inputSchema: {
      brand_name: z.string().min(2).describe("Brand name to search for"),
      domain: z.string().min(3).describe("Your domain (to exclude and verify)"),
      max_results: z.number().int().min(5).max(50).default(20).describe("Max mentions to find"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  },
  async ({ brand_name, domain, max_results }) => {
    try {
      const serpApiKey = process.env.SERP_API_KEY;
      const mentions = await findUnlinkedMentions(brand_name, domain, serpApiKey, max_results);

      const result = {
        brand_name,
        domain,
        unlinked_mentions_found: mentions.length,
        mentions: mentions.map((m) => ({
          page_url: m.pageUrl,
          page_domain: m.pageDomain,
          page_title: m.pageTitle,
          mention_context: m.mentionContext,
          prospect_score: m.prospectScore,
          contact_hint: m.contactHint,
        })),
        recommendation: mentions.length > 0
          ? `Found ${mentions.length} unlinked mentions. These are your highest-conversion outreach targets — the author already knows your brand. Draft personalized emails asking them to add a link.`
          : "No unlinked mentions found. Consider increasing brand visibility through content marketing and PR.",
      };

      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: "text", text: `Unlinked mention search failed: ${error instanceof Error ? error.message : String(error)}` }],
      };
    }
  }
);

// ─────────────────────────────────────────────
// Tool 4: Find Link Intersections
// ─────────────────────────────────────────────

server.registerTool(
  "offpage_find_link_intersections",
  {
    title: "Find Link Intersections",
    description: `Find domains that link to 2+ competitors but not to you. These are the highest-probability link targets because the site owner is clearly interested in your niche.

Args:
  - your_domain (string): Your domain
  - competitor_domains (string[]): Competitor domains to check (2-5)
  - max_results (number): Maximum intersections to return (default: 20)

Returns: Domains linking to multiple competitors but not you, sorted by opportunity score.`,
    inputSchema: {
      your_domain: z.string().min(3).describe("Your domain"),
      competitor_domains: z.array(z.string().min(3)).min(2).max(5).describe("Competitor domains (2-5)"),
      max_results: z.number().int().min(5).max(50).default(20).describe("Max results"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  async ({ your_domain, competitor_domains, max_results }) => {
    try {
      const serpApiKey = process.env.SERP_API_KEY;
      const intersections = await findLinkIntersections(your_domain, competitor_domains, serpApiKey, max_results);

      const result = {
        your_domain,
        competitors_analyzed: competitor_domains,
        intersections_found: intersections.length,
        intersections: intersections.map((i) => ({
          domain: i.domain,
          url: i.url,
          title: i.title,
          links_to_competitors: i.linksToCompetitors,
          competitor_count: i.linksToCompetitors.length,
          prospect_score: i.prospectScore,
          pitch_angle: i.pitchAngle,
        })),
        priority_tiers: {
          high: intersections.filter((i) => i.linksToCompetitors.length >= 3).length,
          medium: intersections.filter((i) => i.linksToCompetitors.length === 2).length,
          low: intersections.filter((i) => i.linksToCompetitors.length === 1).length,
        },
        recommendation: intersections.length > 0
          ? `Found ${intersections.length} link intersection opportunities. Sites linking to ${intersections[0]?.linksToCompetitors.length || 2}+ competitors are your best targets — they clearly cover your niche.`
          : "No intersections found. Try adding more competitors or broader niche competitors.",
      };

      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: "text", text: `Link intersection analysis failed: ${error instanceof Error ? error.message : String(error)}` }],
      };
    }
  }
);

// ─────────────────────────────────────────────
// Tool 5: Discover PR Opportunities
// ─────────────────────────────────────────────

server.registerTool(
  "offpage_discover_pr_opportunities",
  {
    title: "Discover Digital PR Opportunities",
    description: `Find digital PR angles and opportunities for earning press coverage and high-authority backlinks.

Args:
  - niche (string): Your industry/niche
  - brand_name (string): Your brand name
  - max_results (number): Maximum opportunities (default: 15)

Returns: PR opportunities including data stories, newsjacking angles, expert commentary requests, and trend pieces.`,
    inputSchema: {
      niche: z.string().min(2).describe("Your niche/industry"),
      brand_name: z.string().min(1).describe("Your brand name"),
      max_results: z.number().int().min(5).max(30).default(15).describe("Max opportunities"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  },
  async ({ niche, brand_name, max_results }) => {
    try {
      const serpApiKey = process.env.SERP_API_KEY;
      const opportunities = await discoverPROpportunities(niche, brand_name, serpApiKey);

      const byType: Record<string, number> = {};
      for (const opp of opportunities) {
        byType[opp.type] = (byType[opp.type] || 0) + 1;
      }

      const result = {
        niche,
        brand_name,
        opportunities_found: opportunities.length,
        by_type: byType,
        opportunities: opportunities.slice(0, max_results),
        strategy_recommendations: [
          "Data stories: Conduct original research (surveys, data analysis) and pitch to journalists",
          "Newsjacking: React quickly to breaking news with expert commentary",
          "Expert commentary: Position your team as go-to sources for journalist queries",
          "Trend pieces: Create comprehensive trend reports that publications want to cite",
          "HARO/journalist queries: Monitor and respond to journalist requests within hours",
        ],
      };

      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: "text", text: `PR opportunity discovery failed: ${error instanceof Error ? error.message : String(error)}` }],
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
  console.error("Offpage MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
