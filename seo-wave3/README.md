# SEO Wave 3 — Scale & Report Plugin

Rank tracking, automated reporting, anomaly detection, link building outreach, and strategy recalibration.

## What's Included

### Slash Commands
| Command | Description |
|---------|-------------|
| `/seo-wave3:ranks <site-url>` | Check keyword ranking positions and movement |
| `/seo-wave3:report <site-url>` | Generate client-ready SEO performance report |
| `/seo-wave3:diagnose <site-url>` | Detect and diagnose SEO anomalies |
| `/seo-wave3:backlinks <site-url>` | Monitor backlink profile and find gaps |
| `/seo-wave3:outreach <site-url>` | Discover link prospects and draft outreach emails |
| `/seo-wave3:update-check` | Check for recent Google algorithm updates |
| `/seo-wave3:dashboard` | Master overview of all SEO metrics |

### Skills (Auto-Invoked)
| Skill | Triggers On |
|-------|-------------|
| `rank-tracker` | "check rankings", "where do I rank", "keyword positions", "SERP position" |
| `seo-reporter` | "SEO report", "client report", "monthly review", "performance summary" |
| `anomaly-detector` | "rankings dropped", "traffic decrease", "what happened", "diagnose" |
| `outreach-engine` | "link building", "outreach", "get backlinks", "guest post" |

### Subagents
| Agent | Role |
|-------|------|
| `seo-monitor` | Rank tracking, anomaly detection, algorithm update correlation |
| `seo-reporter-agent` | Report generation, data aggregation, client deliverables |
| `outreach-agent` | Prospect discovery, email drafting, campaign management |

### MCP Server Tools
| Tool | Description |
|------|-------------|
| `monitor_check_rankings` | Check SERP positions for keywords against a target domain |
| `monitor_check_algorithm_updates` | Search for recent Google algorithm updates |
| `monitor_find_link_prospects` | Discover link building targets by niche and strategy |
| `monitor_find_broken_links_on_site` | Find broken links on external sites for outreach |
| `monitor_check_backlinks` | Analyze backlink profile via SERP analysis |
| `monitor_draft_outreach_email` | Generate personalized outreach emails with follow-ups |

### Hooks
- **PostToolUse on monitoring MCP**: Prompts dashboard check after data updates
- **PostToolUse on Gmail**: Reminds to log outreach emails in pipeline

## MCP Integration Map

```
┌──────────────────────────────────────────────────────────────────────┐
│                         Claude Code                                  │
│                                                                      │
│  /ranks  /report  /diagnose  /backlinks  /outreach  /dashboard      │
│     │       │        │          │           │           │            │
│  ┌──┴───────┴────────┴──────────┴───────────┴───────────┴───┐       │
│  │              Skills & Subagents                           │       │
│  │  rank-tracker │ seo-reporter │ anomaly-detector           │       │
│  │  outreach-engine │ seo-monitor │ reporter │ outreach-agent│       │
│  └──┬───────┬────────┬──────────┬───────────┬───────────────┘       │
│     │       │        │          │           │                        │
├─────┼───────┼────────┼──────────┼───────────┼────────────────────────┤
│     ▼       ▼        ▼          ▼           ▼                        │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌────────┐ ┌──────────┐ ┌────────┐     │
│  │Mon.  │ │Web-  │ │Supa- │ │Gmail   │ │Google    │ │Wave 1  │     │
│  │MCP   │ │flow  │ │base  │ │MCP     │ │Calendar  │ │& 2 MCPs│     │
│  │Server│ │MCP   │ │MCP   │ │        │ │MCP       │ │        │     │
│  └──────┘ └──────┘ └──────┘ └────────┘ └──────────┘ └────────┘     │
│  Rank     Verify   Store    Send       Schedule    Audit &          │
│  Check    Changes  History  Reports    Reports     Content          │
│  Backlink          Anomaly  Outreach   Follow-ups  Data             │
│  Prospect          Rankings Alerts     Reminders                    │
└──────────────────────────────────────────────────────────────────────┘
```

## Setup

### Prerequisites
- Claude Code CLI installed
- Node.js 18+
- Wave 1 plugin installed (for technical audit data)
- Wave 2 plugin installed (for content pipeline data)
- (Recommended) SerpAPI key — for reliable SERP and ranking data
- (Optional) Webflow MCP — for site verification
- (Required) Supabase MCP — for historical data storage
- (Optional) Gmail MCP — for report delivery and outreach
- (Optional) Google Calendar MCP — for scheduling

### Installation

```bash
# Install as plugin
claude /plugin install /path/to/seo-wave3-plugin

# Build the MCP server
cd /path/to/seo-wave3-plugin/servers/monitoring-mcp-server
npm install
npm run build
```

### Environment Variables

```bash
# Recommended: For reliable SERP ranking data
export SERP_API_KEY="your-serpapi-key"

# Optional: For Core Web Vitals monitoring
export GOOGLE_PAGESPEED_API_KEY="your-pagespeed-key"
```

### Supabase Tables (Wave 3 additions)

```sql
-- Ranking snapshots
CREATE TABLE seo_rank_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword_id UUID,
  keyword TEXT NOT NULL,
  site_url TEXT NOT NULL,
  target_url TEXT,
  ranking_url TEXT,
  position INTEGER,
  previous_position INTEGER,
  position_change INTEGER,
  serp_features JSONB DEFAULT '[]',
  owns_feature BOOLEAN DEFAULT false,
  device TEXT DEFAULT 'mobile',
  locale TEXT DEFAULT 'en-US',
  checked_at TIMESTAMPTZ DEFAULT now()
);

-- Backlink snapshots
CREATE TABLE seo_backlink_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_url TEXT NOT NULL,
  referring_domains INTEGER,
  total_backlinks INTEGER,
  new_links JSONB DEFAULT '[]',
  lost_links JSONB DEFAULT '[]',
  top_referrers JSONB DEFAULT '[]',
  toxic_flags JSONB DEFAULT '[]',
  snapshot_at TIMESTAMPTZ DEFAULT now()
);

-- Anomaly records
CREATE TABLE seo_anomalies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_url TEXT NOT NULL,
  anomaly_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  description TEXT NOT NULL,
  probable_cause TEXT,
  confidence TEXT,
  affected_keywords JSONB DEFAULT '[]',
  affected_urls JSONB DEFAULT '[]',
  recommended_actions JSONB DEFAULT '[]',
  status TEXT DEFAULT 'detected',
  detected_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Outreach log
CREATE TABLE seo_outreach_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_url TEXT NOT NULL,
  campaign_type TEXT NOT NULL,
  prospect_domain TEXT NOT NULL,
  prospect_url TEXT,
  contact_email TEXT,
  contact_name TEXT,
  relevance_score INTEGER,
  quality_score INTEGER,
  email_subject TEXT,
  email_body TEXT,
  email_sent_at TIMESTAMPTZ,
  follow_up_sent_at TIMESTAMPTZ,
  follow_up_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'prospect',
  link_url TEXT,
  link_anchor_text TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Report history
CREATE TABLE seo_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_url TEXT NOT NULL,
  report_type TEXT NOT NULL,
  report_period TEXT,
  format TEXT DEFAULT 'md',
  delivered_to TEXT,
  delivered_at TIMESTAMPTZ,
  metrics_snapshot JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Report schedule
CREATE TABLE seo_report_schedule (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_url TEXT NOT NULL,
  report_type TEXT NOT NULL,
  frequency TEXT NOT NULL,
  recipient_email TEXT,
  next_due DATE,
  calendar_event_id TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## Usage Examples

```
# Check rankings for all tracked keywords
/seo-wave3:ranks https://example.com

# Generate a monthly client report
/seo-wave3:report https://example.com --type monthly --format docx --email client@company.com

# Investigate a ranking drop
/seo-wave3:diagnose https://example.com --keyword "home gym equipment"

# Check for algorithm updates
/seo-wave3:update-check --site https://example.com

# Monitor backlinks and find gaps vs competitor
/seo-wave3:backlinks https://example.com --competitor https://competitor.com --compare

# Start a guest post outreach campaign
/seo-wave3:outreach https://example.com --strategy guest_post --max-prospects 20

# See the full dashboard
/seo-wave3:dashboard --site https://example.com
```

Natural language:
- "Check where my site ranks for our target keywords"
- "Why did our rankings drop this week?"
- "Generate a monthly report for the client"
- "Find guest post opportunities in the fitness niche"
- "Are there any Google algorithm updates recently?"
- "Show me the SEO dashboard for all my sites"

## How All Three Waves Work Together

```
Wave 1 (Foundation)          Wave 2 (Content)           Wave 3 (Scale)
┌─────────────────┐         ┌─────────────────┐        ┌─────────────────┐
│ Technical Audit  │         │ Keyword Research │        │ Rank Tracking   │
│ On-Page Optimize │───────▶ │ Content Briefs   │──────▶ │ Reporting       │
│ Schema Markup    │         │ AI Writing       │        │ Anomaly Detect  │
│ Bulk Fixes       │         │ SEO Scoring      │        │ Outreach        │
│                  │         │ Auto-Publish     │        │ Strategy Recal  │
└────────┬────────┘         └────────┬────────┘        └────────┬────────┘
         │                           │                          │
         └───────────┬───────────────┘                          │
                     │                                          │
              ┌──────▼──────┐                           ┌───────▼──────┐
              │  Webflow    │                           │    Gmail     │
              │  Supabase   │◀──────────────────────────│  Calendar    │
              └─────────────┘                           └──────────────┘
                 Shared                                   Delivery &
                 Data Layer                               Scheduling
```

- **Wave 1** audits and fixes → establishes technical foundation
- **Wave 2** researches and publishes → drives content growth
- **Wave 3** monitors and reports → tracks impact and adjusts strategy
- **All waves** share Supabase for data continuity and Webflow for site access
- **Wave 3** uniquely adds Gmail (reports + outreach) and Calendar (scheduling)
