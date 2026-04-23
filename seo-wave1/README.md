# SEO Wave 1 — Claude Code Plugin

Automated technical SEO auditing, on-page optimization, schema markup generation, and bulk Webflow updates.

## What's Included

### Slash Commands
| Command | Description |
|---------|-------------|
| `/seo-wave1:audit <url>` | Full technical SEO audit with scoring |
| `/seo-wave1:fix [--all\|--titles\|--descriptions\|--alt-text\|--schema\|--links]` | Auto-fix issues via Webflow |
| `/seo-wave1:check <url>` | Quick single-page SEO check |
| `/seo-wave1:report <url>` | Generate client-ready SEO report |

### Skills (Auto-Invoked)
| Skill | Triggers On |
|-------|-------------|
| `seo-audit` | "audit site", "SEO health", "technical SEO", "check site" |
| `onpage-optimizer` | "optimize titles", "fix meta tags", "internal linking" |
| `schema-generator` | "add schema", "structured data", "rich snippets", "JSON-LD" |

### Subagents
| Agent | Role |
|-------|------|
| `seo-auditor` | Deep technical crawling and analysis |
| `seo-optimizer` | Generating and pushing on-page optimizations |

### MCP Server Tools
| Tool | Description |
|------|-------------|
| `seo_crawl_site` | Breadth-first crawl with SEO data extraction |
| `seo_audit_meta_tags` | Title, description, H1, canonical, OG, robots audit |
| `seo_audit_images` | Alt text, dimensions, optimization check |
| `seo_check_links` | Broken internal/external link detection |
| `seo_check_core_web_vitals` | LCP, CLS, FID via PageSpeed API |
| `seo_check_schema` | JSON-LD structured data validation |
| `seo_check_sitemap` | Sitemap.xml and robots.txt analysis |
| `seo_full_audit_score` | Complete crawl + score in one operation |

### Hook
- **PostToolUse on Webflow**: Reminds to run SEO check after any Webflow content modification

## Setup

### Prerequisites
- Claude Code CLI installed
- Node.js 18+
- (Optional) Webflow MCP connected — for auto-fixing
- (Optional) Supabase MCP connected — for storing audit history
- (Optional) Google PageSpeed API key — for Core Web Vitals

### Installation

**Option A: Install as plugin**
```bash
# From local directory
claude /plugin install /path/to/seo-wave1-plugin

# Or from GitHub (after pushing)
claude /plugin install https://github.com/youruser/seo-wave1-plugin
```

**Option B: Manual setup**
```bash
# 1. Clone/copy the plugin to your preferred location
cp -r seo-wave1-plugin ~/.claude/plugins/seo-wave1

# 2. Build the MCP server
cd ~/.claude/plugins/seo-wave1/servers/seo-mcp-server
npm install
npm run build

# 3. Add MCP server to Claude Code
claude mcp add seo-audit-server node ~/.claude/plugins/seo-wave1/servers/seo-mcp-server/dist/index.js
```

### Environment Variables

```bash
# Optional: For Core Web Vitals checking
export GOOGLE_PAGESPEED_API_KEY="your-api-key"
```

### Supabase Tables (Optional)

If using Supabase for audit history, create these tables:

```sql
-- Audit runs
CREATE TABLE seo_audits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_url TEXT NOT NULL,
  scores JSONB NOT NULL,
  pages_crawled INTEGER,
  total_issues INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Individual issues
CREATE TABLE seo_issues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID REFERENCES seo_audits(id),
  page_url TEXT NOT NULL,
  issue TEXT NOT NULL,
  severity TEXT NOT NULL,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Change log (for rollback)
CREATE TABLE seo_changes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_url TEXT NOT NULL,
  page_url TEXT NOT NULL,
  field TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  pushed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## Usage Examples

```
# Full site audit
/seo-wave1:audit https://example.com

# Quick page check
/seo-wave1:check https://example.com/about

# Fix all issues on a Webflow site
/seo-wave1:fix --all

# Just fix title tags
/seo-wave1:fix --titles

# Generate client report
/seo-wave1:report https://example.com --format docx --compare
```

Or use natural language:
- "Run an SEO audit on my Webflow site"
- "Check the meta tags on our homepage"
- "Add schema markup to all product pages"
- "Optimize title tags across the site"
- "Find broken links on example.com"

## MCP Integration Map

```
┌─────────────────────────────────────────────────────┐
│                  Claude Code                         │
│                                                      │
│  /audit  /fix  /check  /report                      │
│     │      │      │       │                          │
│  ┌──┴──────┴──────┴───────┴──┐                      │
│  │    SEO Skills & Agents     │                      │
│  └──┬──────┬──────┬──────────┘                      │
│     │      │      │                                  │
├─────┼──────┼──────┼──────────────────────────────────┤
│     ▼      ▼      ▼                                  │
│  ┌──────┐ ┌────────┐ ┌──────────┐ ┌──────────────┐  │
│  │ SEO  │ │Webflow │ │Supabase  │ │  Gmail MCP   │  │
│  │ MCP  │ │  MCP   │ │  MCP     │ │  (alerts)    │  │
│  │Server│ │(push)  │ │(storage) │ │              │  │
│  └──────┘ └────────┘ └──────────┘ └──────────────┘  │
│  Crawl     Update     Store        Send              │
│  Audit     Meta       Audits       Reports           │
│  Score     Schema     Changes      Alerts            │
│  Check     Alt Text   Issues                         │
└─────────────────────────────────────────────────────┘
```

## Contributing

To extend this plugin:
1. Add new tools to `servers/seo-mcp-server/src/index.ts`
2. Add new skills to `skills/` directory
3. Add new commands to `commands/` directory
4. Rebuild: `cd servers/seo-mcp-server && npm run build`
