---
name: competitor-backlink-analyzer
description: Reverse-engineer competitor backlink profiles to find link gaps, discover their top-performing content by links, identify common linking domains, and extract replicable link-building strategies. Use when the user asks about competitor backlinks, link gaps, competitor link analysis, who links to competitors, competitor link strategies, or backlink comparison. Also activates for "competitor backlinks", "link gap", "backlink gap", "who links to my competitor", "competitor link profile", "reverse engineer backlinks", or "compare backlinks".
---

# Competitor Backlink Analyzer

Reverse-engineer competitor backlink profiles to find exploitable link gaps and replicable strategies.

## Analysis Process

### Step 1: Profile Both Domains

Use `offpage_competitor_backlinks` to:
1. Discover backlinks for your domain
2. Discover backlinks for the competitor domain
3. Map referring domains for both

### Step 2: Link Gap Analysis

Identify domains linking to the competitor but NOT to you:

**Prioritization Criteria**:
| Factor | Weight | Why |
|--------|--------|-----|
| Domain already covers your niche | High | They're likely to link to you too |
| Resource/directory page | High | Easy to get added |
| Editorial/blog content | Medium | May accept guest posts or link additions |
| News/press coverage | Medium | Indicates PR opportunity |
| Forum/community mention | Low | Limited link value but good for awareness |

**Link Gap Dashboard**:
```
🔍 LINK GAP ANALYSIS — you vs competitor.com

Your referring domains:     45
Competitor referring domains: 112
Link gap:                    67 domains

Priority Prospects:
  🔴 High (links to 3+ competitors):  8 domains
  🟡 Medium (links to 2 competitors): 15 domains
  🟢 Standard (links to 1 competitor): 44 domains

Top 10 Gap Opportunities:
| # | Domain | Links To | Type | Score |
|---|--------|----------|------|-------|
| 1 | resource-site.com | 3 competitors | Resource page | 95 |
| 2 | niche-blog.com | 2 competitors | Blog/editorial | 88 |
```

### Step 3: Competitor Top Content by Links

Find which competitor pages attract the most backlinks:
1. Discover their most-linked pages
2. Identify the content types that earn links (guides, tools, data, infographics)
3. Map who links to those pages
4. Assess whether you can create superior content (skyscraper potential)

**Content Analysis**:
```
📝 COMPETITOR TOP CONTENT — competitor.com

| Page | Est. Backlinks | Type | Skyscraper? |
|------|---------------|------|-------------|
| /ultimate-guide-to-X | 45 | Guide | Yes — yours is outdated |
| /free-calculator-tool | 32 | Tool | Yes — add more features |
| /industry-report-2025 | 28 | Data | Yes — publish 2026 version |
```

### Step 4: Common Domain Analysis

Identify domains linking to BOTH you and the competitor:
- These sites clearly cover your niche
- They already know both brands
- Good candidates for additional link requests (new content, updated resources)

### Step 5: Strategy Extraction

Analyze the link gap to identify which strategies the competitor uses:

| Pattern Detected | Strategy | Your Action |
|-----------------|----------|-------------|
| Listed on resource pages | Resource page outreach | Submit your site to the same pages |
| Guest posts on external sites | Guest posting | Pitch the same publications |
| Featured in reviews/comparisons | Product marketing | Request inclusion in reviews |
| Press/news coverage | Digital PR | Develop PR angles for same outlets |
| Forum/community mentions | Community marketing | Participate in same communities |
| Linked from tools/calculators | Link bait creation | Build free tools in your niche |

### Step 6: Store & Report

Save to Supabase:
```
Table: seo_competitor_backlink_analysis
- id, your_domain, competitor_domain, analyzed_at
- your_referring_domains, competitor_referring_domains
- link_gap_count, common_domains_count
- link_gap_prospects (JSONB)
- competitor_top_content (JSONB)
- replicable_strategies (JSONB)
```

## Multi-Competitor Analysis

When analyzing multiple competitors:
1. Run analysis against each competitor individually
2. Merge link gaps — domains appearing in multiple gaps are highest priority
3. Use `offpage_find_link_intersections` for domains linking to 2+ competitors
4. Create a unified prospect list sorted by cross-competitor presence

## Action Handoff

After analysis:
- High-priority gap prospects → Feed to `outreach-engine` for email drafting
- Skyscraper opportunities → Feed to Wave 2 `content-brief-generator` for content creation
- PR opportunities → Feed to `digital-pr-strategist` for pitch development
- Resource pages → Direct outreach with `outreach-engine`
