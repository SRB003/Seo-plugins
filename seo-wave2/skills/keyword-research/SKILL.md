---
name: keyword-research
description: Discover, analyze, and cluster keyword opportunities for SEO content strategy. Use when the user asks to find keywords, research search terms, identify content gaps, discover what people are searching for, analyze competitor keywords, build a keyword strategy, or find long-tail opportunities. Also activates for "keyword research", "search volume", "keyword difficulty", "content gaps", "competitor analysis keywords", or "what should I write about".
---

# Keyword Research & Discovery

Systematic keyword research pipeline that discovers opportunities, clusters by intent, maps to existing content, and identifies gaps.

## Step 1: Seed Keyword Collection

Gather seed keywords from multiple sources:

### 1a. From the User
Ask for:
- Primary business/niche (e.g., "gym equipment", "luxury travel")
- Target geography (e.g., India, US, global)
- Existing site URL (to pull current ranking terms)
- Top 3 competitors (URLs)
- Any specific topics they want to rank for

### 1b. From Existing Site (via Wave 1 SEO MCP or Webflow MCP)
- Pull all page titles, H1s, meta descriptions from the site
- Extract the core topics already covered
- Identify thin content pages that need keyword targeting

### 1c. From SERP Analysis
Use `content_analyze_serp` tool to:
- Search the primary seed keywords
- Extract "People Also Ask" questions
- Pull "Related Searches" suggestions
- Collect autocomplete suggestions via `content_keyword_suggestions`

### 1d. From Competitor Analysis
Use `content_analyze_competitor` tool to:
- Crawl competitor sites and extract their page titles/H1s
- Identify topics they cover that you don't (content gaps)
- Note their URL structure patterns for topic clusters

## Step 2: Keyword Expansion

From each seed keyword, expand using:

1. **Modifier patterns**: Add prefixes/suffixes
   - "best [keyword]", "[keyword] for beginners", "how to [keyword]"
   - "[keyword] in [city]", "[keyword] vs [alternative]"
   - "[keyword] price", "[keyword] review", "buy [keyword]"
   
2. **Question mining**: Transform into questions
   - "what is [keyword]", "how does [keyword] work"
   - "why [keyword]", "when to [keyword]"
   
3. **Long-tail discovery**: Use `content_keyword_suggestions` for autocomplete-style expansions

4. **Related terms**: Use `content_related_keywords` to find semantically related terms (LSI keywords)

## Step 3: Keyword Metrics

For each discovered keyword, collect:
- **Estimated search volume** (from SERP analysis signals)
- **Keyword difficulty estimate** (based on SERP competition analysis)
- **Search intent classification**: Informational / Navigational / Transactional / Commercial
- **SERP features present**: Featured snippets, PAA, local pack, shopping, video

Use `content_estimate_difficulty` which analyzes page 1 results to estimate competition level.

## Step 4: Keyword Clustering

Group keywords into clusters:

### By Topic
Keywords that would be served by the same page. Example:
- Cluster: "home gym equipment"
  - "best home gym equipment"
  - "home gym equipment for small spaces"
  - "home gym equipment list"
  - "affordable home gym setup"

### By Intent
- **Informational** → Blog posts, guides, how-tos
- **Transactional** → Product pages, landing pages
- **Commercial Investigation** → Comparison pages, reviews
- **Navigational** → Brand pages, category pages

### By Funnel Stage
- **Top of Funnel (TOFU)**: Awareness, broad informational
- **Middle of Funnel (MOFU)**: Consideration, comparison, how-to
- **Bottom of Funnel (BOFU)**: Purchase intent, pricing, specific products

## Step 5: Content Mapping

For each keyword cluster:

1. **Check existing pages**: Does any current page target this cluster?
   - If YES → flag for on-page optimization (Wave 1 territory)
   - If NO → flag as "new content needed"

2. **Determine content type**:
   - Blog post / article
   - Landing page
   - Product page
   - FAQ section
   - Comparison page
   - Guide / pillar page

3. **Priority scoring** (0-100):
   - Search volume weight: 30%
   - Difficulty (inverse): 25%
   - Business relevance: 25%
   - Content gap score: 20%

## Step 6: Store & Output

### Store in Supabase
If Supabase MCP is connected:

```
Table: seo_keywords
- id, keyword, cluster_id, search_volume_estimate, difficulty_estimate
- intent, funnel_stage, current_ranking_url, status, created_at

Table: seo_keyword_clusters  
- id, site_url, cluster_name, primary_keyword, content_type
- priority_score, assigned_url, status, created_at
```

### Output Format
Present results as:
1. **Executive Summary**: Total keywords found, clusters formed, top opportunities
2. **Cluster Table**: Cluster name | Primary keyword | Volume | Difficulty | Intent | Status
3. **Content Gap List**: Topics competitors rank for that you don't
4. **Quick Wins**: Low difficulty + decent volume keywords you can target fast
5. **Priority Roadmap**: Ordered list of content to create, by priority score

## Tips for Quality

- Prefer long-tail keywords (3-5 words) for newer sites — easier to rank
- Always verify intent by actually checking the SERP (what type of content ranks?)
- Don't chase volume alone — a 100-volume transactional keyword beats a 10,000-volume informational one for revenue
- Cluster aggressively — one strong pillar page > five thin pages targeting similar terms
- Revisit quarterly — search trends shift
