# SEO Offpage — Link Intelligence & Authority Building Plugin

Backlink auditing, competitor backlink analysis, digital PR strategy, unlinked mention discovery, and link intersection analysis.

## What's Included

### Slash Commands
| Command | Description |
|---------|-------------|
| `/seo-offpage:audit-backlinks <domain>` | Audit backlink profile with toxic link detection and anchor text analysis |
| `/seo-offpage:competitor-backlinks <domain>` | Reverse-engineer competitor backlink profile and find link gaps |
| `/seo-offpage:unlinked-mentions --brand "Name"` | Find brand mentions that don't include a backlink |
| `/seo-offpage:link-intersections <domain>` | Find domains linking to 2+ competitors but not to you |
| `/seo-offpage:digital-pr --niche "industry"` | Discover PR opportunities and generate pitch drafts |

### Skills (Auto-Invoked)
| Skill | Triggers On |
|-------|-------------|
| `backlink-auditor` | "audit backlinks", "toxic links", "disavow", "anchor text", "backlink profile" |
| `competitor-backlink-analyzer` | "competitor backlinks", "link gap", "backlink gap", "who links to competitor" |
| `digital-pr-strategist` | "digital PR", "press coverage", "journalist outreach", "HARO", "newsjack" |
| `unlinked-mention-finder` | "unlinked mentions", "brand mentions", "mentions without links", "find mentions" |
| `link-intersection-finder` | "link intersection", "shared backlinks", "common linkers", "competitor common links" |

### Subagents
| Agent | Role |
|-------|------|
| `backlink-analyst` | Backlink auditing, toxic link detection, anchor text analysis |
| `competitor-intel` | Competitor backlink reverse-engineering, link gap & intersection analysis |
| `pr-outreach` | Digital PR strategy, unlinked mention conversion, journalist outreach |

### MCP Server Tools
| Tool | Description |
|------|-------------|
| `offpage_audit_backlinks` | Audit a domain's backlink profile with toxicity and anchor analysis |
| `offpage_competitor_backlinks` | Compare your backlinks vs a competitor and find link gaps |
| `offpage_find_unlinked_mentions` | Discover brand mentions that don't link to your site |
| `offpage_find_link_intersections` | Find domains linking to 2+ competitors but not you |
| `offpage_discover_pr_opportunities` | Find digital PR angles and opportunities in your niche |

### Hooks
- **PostToolUse on offpage MCP**: Prompts dashboard check after data updates
- **PostToolUse on Gmail**: Reminds to log outreach in pipeline

## MCP Integration Map

```
┌──────────────────────────────────────────────────────────────────────┐
│                         Claude Code                                  │
│                                                                      │
│  /audit-backlinks  /competitor  /mentions  /intersections  /pr      │
│        │               │           │            │           │        │
│  ┌─────┴───────────────┴───────────┴────────────┴───────────┴──┐    │
│  │                   Skills & Subagents                         │    │
│  │  backlink-auditor │ competitor-backlink-analyzer              │    │
│  │  digital-pr-strategist │ unlinked-mention-finder              │    │
│  │  link-intersection-finder │ backlink-analyst │ competitor-intel│    │
│  │  pr-outreach                                                 │    │
│  └─────┬───────┬───────────┬────────────┬───────────────────────┘    │
│        │       │           │            │                            │
├────────┼───────┼───────────┼────────────┼────────────────────────────┤
│        ▼       ▼           ▼            ▼                            │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌────────┐ ┌──────────┐ ┌────────┐     │
│  │Off-  │ │Web-  │ │Supa- │ │Gmail   │ │Google    │ │Wave 3  │     │
│  │page  │ │flow  │ │base  │ │MCP     │ │Calendar  │ │Monitor │     │
│  │MCP   │ │MCP   │ │MCP   │ │        │ │MCP       │ │MCP     │     │
│  │Server│ │      │ │      │ │        │ │          │ │        │     │
│  └──────┘ └──────┘ └──────┘ └────────┘ └──────────┘ └────────┘     │
│  Backlink  Verify  Store    Send       Schedule    Rank &           │
│  Audit     Site    History  Pitches    Follow-ups  Anomaly          │
│  Compete   Changes Mentions Outreach   Campaigns   Data             │
│  PR Disc           Intersect Alerts                                  │
└──────────────────────────────────────────────────────────────────────┘
```

## Setup

### Prerequisites
- Claude Code CLI installed
- Node.js 18+
- (Recommended) SerpAPI key — for reliable SERP and backlink data
- (Required) Supabase MCP — for historical data storage
- (Optional) Gmail MCP — for outreach and PR emails
- (Optional) Google Calendar MCP — for scheduling campaigns
- (Optional) Wave 3 plugin — for outreach pipeline integration

### Installation

```bash
# Install as plugin
claude /plugin install /path/to/seo-offpage-plugin

# Build the MCP server
cd /path/to/seo-offpage-plugin/servers/offpage-mcp-server
npm install
npm run build
```

### Environment Variables

```bash
# Recommended: For reliable SERP and backlink data
export SERP_API_KEY="your-serpapi-key"

# Optional: For Core Web Vitals checks
export GOOGLE_PAGESPEED_API_KEY="your-pagespeed-key"
```

### Supabase Tables (Offpage additions)

```sql
-- Backlink audit history
CREATE TABLE seo_backlink_audit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL,
  audit_date TIMESTAMPTZ DEFAULT now(),
  total_backlinks INTEGER,
  referring_domains INTEGER,
  dofollow_ratio NUMERIC,
  anchor_distribution JSONB DEFAULT '{}',
  toxic_links_count INTEGER DEFAULT 0,
  disavow_count INTEGER DEFAULT 0,
  health_score INTEGER,
  full_results JSONB DEFAULT '{}'
);

-- Competitor backlink analysis
CREATE TABLE seo_competitor_backlink_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  your_domain TEXT NOT NULL,
  competitor_domain TEXT NOT NULL,
  analyzed_at TIMESTAMPTZ DEFAULT now(),
  your_referring_domains INTEGER,
  competitor_referring_domains INTEGER,
  link_gap_count INTEGER,
  common_domains_count INTEGER,
  link_gap_prospects JSONB DEFAULT '[]',
  competitor_top_content JSONB DEFAULT '[]',
  replicable_strategies JSONB DEFAULT '[]'
);

-- Unlinked mentions
CREATE TABLE seo_unlinked_mentions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_name TEXT NOT NULL,
  domain TEXT NOT NULL,
  mention_url TEXT NOT NULL,
  mention_domain TEXT NOT NULL,
  mention_title TEXT,
  mention_context TEXT,
  prospect_score INTEGER,
  contact_email TEXT,
  contact_name TEXT,
  outreach_status TEXT DEFAULT 'discovered',
  outreach_sent_at TIMESTAMPTZ,
  follow_up_sent_at TIMESTAMPTZ,
  link_added BOOLEAN DEFAULT false,
  link_url TEXT,
  discovered_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Link intersections
CREATE TABLE seo_link_intersections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  your_domain TEXT NOT NULL,
  competitors_analyzed JSONB DEFAULT '[]',
  intersection_domain TEXT NOT NULL,
  intersection_url TEXT,
  intersection_title TEXT,
  links_to_competitors JSONB DEFAULT '[]',
  competitor_count INTEGER,
  prospect_score INTEGER,
  pitch_angle TEXT,
  content_type TEXT,
  outreach_status TEXT DEFAULT 'discovered',
  discovered_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- PR campaigns
CREATE TABLE seo_pr_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_name TEXT NOT NULL,
  campaign_type TEXT NOT NULL,
  pitch_topic TEXT,
  pitch_angle TEXT,
  target_outlets JSONB DEFAULT '[]',
  pitches_sent INTEGER DEFAULT 0,
  responses INTEGER DEFAULT 0,
  coverage_earned INTEGER DEFAULT 0,
  links_earned JSONB DEFAULT '[]',
  coverage_urls JSONB DEFAULT '[]',
  status TEXT DEFAULT 'planning',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

## Usage Examples

```
# Audit your backlink profile
/seo-offpage:audit-backlinks example.com --brand "Example Co"

# Analyze competitor backlinks and find gaps
/seo-offpage:competitor-backlinks example.com --competitor rival.com

# Find unlinked brand mentions
/seo-offpage:unlinked-mentions --brand "Example Co" --domain example.com

# Find link intersections across competitors
/seo-offpage:link-intersections example.com --competitors rival1.com,rival2.com,rival3.com

# Discover digital PR opportunities
/seo-offpage:digital-pr --niche "fitness equipment" --brand "Example Co"
```

Natural language:
- "Audit my backlink profile and check for toxic links"
- "Who links to my competitor but not to me?"
- "Find brand mentions that don't link to us"
- "What domains link to all 3 of my competitors?"
- "Find PR opportunities in the fitness space"
- "Generate a disavow file for toxic backlinks"
- "Compare our backlinks vs competitor.com"

## How Offpage Fits With Other Plugins

```
Wave 1 (Technical)     Wave 2 (Content)     Wave 3 (Monitor)      Offpage (Links)
┌────────────────┐    ┌────────────────┐    ┌────────────────┐    ┌────────────────┐
│ Technical Audit │    │ Keyword Research│    │ Rank Tracking  │    │ Backlink Audit │
│ On-Page Optimize│    │ Content Briefs  │    │ Reporting      │    │ Competitor BLs │
│ Schema Markup   │    │ AI Writing      │    │ Anomaly Detect │    │ Digital PR     │
│ Bulk Fixes      │    │ SEO Scoring     │    │ Outreach       │    │ Unlinked Ment. │
│                 │    │ Auto-Publish    │    │ Strategy Recal │    │ Link Intersect │
└───────┬────────┘    └───────┬────────┘    └───────┬────────┘    └───────┬────────┘
        │                     │                     │                     │
        └──────────┬──────────┘                     └──────────┬──────────┘
                   │                                           │
            ┌──────▼──────┐                             ┌──────▼──────┐
            │  Webflow    │                             │    Gmail    │
            │  Supabase   │◀────────────────────────────│  Calendar   │
            └─────────────┘                             └─────────────┘
              Shared                                      Outreach &
              Data Layer                                  Scheduling

Wave 1 fixes foundation → Wave 2 creates content → Offpage builds authority → Wave 3 monitors impact
```

- **Wave 1** provides technical foundation that makes link building effective
- **Wave 2** creates linkable content assets for outreach and PR
- **Wave 3** monitors ranking impact of links earned and manages outreach pipeline
- **Offpage** focuses on link intelligence, authority building, and earning external signals
- **All plugins** share Supabase for data continuity
