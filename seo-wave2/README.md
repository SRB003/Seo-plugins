# SEO Wave 2 — Content Engine Plugin

Keyword research, content brief generation, AI content drafting, SEO scoring, and auto-publish to Webflow CMS.

## What's Included

### Slash Commands
| Command | Description |
|---------|-------------|
| `/seo-wave2:keywords <url-or-niche>` | Discover and cluster keyword opportunities |
| `/seo-wave2:brief <keyword>` | Generate a writer-ready content brief |
| `/seo-wave2:write <keyword-or-brief-id>` | Draft SEO-optimized content from a brief |
| `/seo-wave2:score <url-or-text>` | Score content against the 100-point SEO scorecard |
| `/seo-wave2:pipeline` | View and manage the full content pipeline dashboard |
| `/seo-wave2:calendar` | Generate and sync a content publishing calendar |

### Skills (Auto-Invoked)
| Skill | Triggers On |
|-------|-------------|
| `keyword-research` | "find keywords", "keyword strategy", "content gaps", "what to write about" |
| `content-brief` | "content brief", "article outline", "writing plan", "structure this article" |
| `content-writer` | "write article", "draft blog post", "create content for keyword" |
| `content-scorer` | "score content", "SEO check article", "ready to publish?", "quality check" |

### Subagents
| Agent | Role |
|-------|------|
| `keyword-strategist` | Deep keyword discovery, SERP analysis, competitor mining, clustering |
| `content-producer` | Brief creation, article drafting, scoring, and Webflow publishing |

### MCP Server Tools
| Tool | Description |
|------|-------------|
| `content_keyword_suggestions` | Expand seed keywords with modifiers, questions, intent classification |
| `content_analyze_serp` | Analyze top-ranking pages for a keyword — structure, word counts, features |
| `content_analyze_competitor` | Crawl a competitor site for content structure and topic coverage |
| `content_estimate_difficulty` | Estimate keyword difficulty from SERP competition signals |
| `content_find_gaps` | Compare your site vs a competitor to find missing topics |
| `content_score_draft` | Score markdown content against the 100-point SEO scorecard |
| `content_score_url` | Fetch a live page and score it for SEO quality |
| `content_related_keywords` | Find semantically related terms (LSI) from ranking content |

### Hooks
- **PostToolUse on Webflow**: Reminds to score content after CMS updates
- **PostToolUse on Supabase**: Prompts pipeline status check after data changes

## MCP Integration Map

```
┌──────────────────────────────────────────────────────────────────────┐
│                         Claude Code                                  │
│                                                                      │
│  /keywords  /brief  /write  /score  /pipeline  /calendar            │
│       │       │       │       │         │          │                  │
│  ┌────┴───────┴───────┴───────┴─────────┴──────────┴──────┐         │
│  │         Skills & Subagents                              │         │
│  │  keyword-research │ content-brief │ content-writer      │         │
│  │  content-scorer   │ keyword-strategist │ content-producer│        │
│  └────┬───────┬───────┬───────┬──────────┬────────────────┘         │
│       │       │       │       │          │                           │
├───────┼───────┼───────┼───────┼──────────┼───────────────────────────┤
│       ▼       ▼       ▼       ▼          ▼                           │
│  ┌────────┐ ┌──────┐ ┌──────┐ ┌────────┐ ┌──────────┐               │
│  │Content │ │Web-  │ │Supa- │ │Gmail   │ │Google    │               │
│  │Engine  │ │flow  │ │base  │ │MCP     │ │Calendar  │               │
│  │MCP     │ │MCP   │ │MCP   │ │        │ │MCP       │               │
│  └────────┘ └──────┘ └──────┘ └────────┘ └──────────┘               │
│  Research   Publish   Store    Email      Schedule                   │
│  Analyze    CMS       Keywords Briefs     Content                    │
│  Score      Content   Briefs   Drafts     Calendar                   │
│  Discover   Meta      Pipeline Reports    Deadlines                  │
└──────────────────────────────────────────────────────────────────────┘
```

## Setup

### Prerequisites
- Claude Code CLI installed
- Node.js 18+
- (Recommended) Wave 1 plugin installed (for site crawl data)
- (Optional) SerpAPI key — for reliable SERP data
- (Optional) Webflow MCP — for auto-publishing to CMS
- (Optional) Supabase MCP — for content pipeline persistence
- (Optional) Gmail MCP — for emailing briefs and drafts
- (Optional) Google Calendar MCP — for content calendar

### Installation

```bash
# Install as plugin
claude /plugin install /path/to/seo-wave2-plugin

# Build the MCP server
cd /path/to/seo-wave2-plugin/servers/content-mcp-server
npm install
npm run build
```

### Environment Variables

```bash
# Optional: For reliable SERP data (recommended)
export SERP_API_KEY="your-serpapi-key"

# Optional: Google Search Console integration
export GOOGLE_SEARCH_CONSOLE_KEY="your-gsc-key"
```

### Supabase Tables

```sql
-- Keywords
CREATE TABLE seo_keywords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL,
  cluster_id UUID,
  search_volume_estimate INTEGER,
  difficulty_estimate INTEGER,
  difficulty_rating TEXT,
  intent TEXT,
  funnel_stage TEXT,
  current_ranking_url TEXT,
  status TEXT DEFAULT 'discovered',
  site_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Keyword Clusters
CREATE TABLE seo_keyword_clusters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_url TEXT NOT NULL,
  cluster_name TEXT NOT NULL,
  primary_keyword TEXT NOT NULL,
  content_type TEXT,
  priority_score INTEGER,
  assigned_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Content Briefs
CREATE TABLE seo_content_briefs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword_cluster_id UUID REFERENCES seo_keyword_clusters(id),
  site_url TEXT NOT NULL,
  primary_keyword TEXT NOT NULL,
  title_suggestion TEXT,
  meta_description TEXT,
  target_word_count INTEGER,
  outline_json JSONB,
  internal_links_json JSONB,
  status TEXT DEFAULT 'draft',
  assigned_to TEXT,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Content Scores
CREATE TABLE seo_content_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brief_id UUID REFERENCES seo_content_briefs(id),
  content_url TEXT,
  score_total INTEGER NOT NULL,
  score_breakdown JSONB NOT NULL,
  issues JSONB,
  strengths JSONB,
  rating TEXT,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Content Log
CREATE TABLE seo_content_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brief_id UUID REFERENCES seo_content_briefs(id),
  site_url TEXT NOT NULL,
  page_url TEXT,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Content Calendar
CREATE TABLE seo_content_calendar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brief_id UUID REFERENCES seo_content_briefs(id),
  site_url TEXT NOT NULL,
  keyword TEXT NOT NULL,
  content_type TEXT,
  draft_deadline DATE,
  publish_date DATE,
  status TEXT DEFAULT 'scheduled',
  calendar_event_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## Usage Examples

```
# Research keywords for a niche
/seo-wave2:keywords "gym equipment" --competitors https://competitor1.com,https://competitor2.com

# Generate a brief for a keyword
/seo-wave2:brief "best home gym equipment for small spaces"

# Write an article from the brief
/seo-wave2:write "best home gym equipment for small spaces" --tone conversational

# Score existing content
/seo-wave2:score https://mysite.com/blog/home-gym-guide --keyword "home gym equipment"

# View the pipeline
/seo-wave2:pipeline --site https://mysite.com

# Create a 4-week content calendar
/seo-wave2:calendar --weeks 4 --frequency 3
```

Or natural language:
- "Research keywords for luxury travel in India"
- "Write a content brief for best gym equipment for home"
- "Draft an article about home workout routines"
- "Is this blog post ready to publish? Score it for SEO"
- "Show me the content pipeline status"
- "Create a publishing calendar for the next 8 weeks"

## How Wave 1 + Wave 2 Work Together

1. **Wave 1** audits your site's technical SEO and fixes on-page elements
2. **Wave 2** builds the content engine on top of that foundation:
   - Keywords → Briefs → Drafts → Scores → Publish
3. Both share Webflow MCP (Wave 1 fixes meta, Wave 2 publishes content)
4. Both share Supabase MCP (Wave 1 stores audits, Wave 2 stores pipeline)
5. Wave 2 adds Gmail (brief/draft delivery) and Google Calendar (content schedule)
