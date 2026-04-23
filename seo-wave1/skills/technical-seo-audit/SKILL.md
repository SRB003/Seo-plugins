---
name: seo-audit
description: Run a comprehensive technical SEO audit on a website. Use when the user asks to audit a site, check SEO health, find technical SEO issues, check broken links, analyze crawlability, review indexing status, or assess Core Web Vitals. Also activates when user mentions "site audit", "SEO check", "technical SEO", or "site health".
---

# Technical SEO Audit

When performing a technical SEO audit, follow this systematic process. The goal is to produce a scored, actionable audit report.

## Step 1: Gather Site Information

Ask the user for:
- The site URL (or pull from Webflow MCP if already connected)
- Whether this is a Webflow site (enables direct fixes via Webflow MCP)
- Google PageSpeed API key (if available, for Core Web Vitals)

## Step 2: Crawl & Analyze

Use the SEO MCP server tools in this order:

### 2a. Site Crawl
Use `seo_crawl_site` to crawl the site. This returns:
- All discoverable URLs
- HTTP status codes (flag 4xx/5xx)
- Redirect chains (flag chains > 2 hops)
- Response times per page

### 2b. Meta Tag Audit
Use `seo_audit_meta_tags` for each page. Check:
- **Title tag**: Present, unique, 50-60 chars, contains target keyword
- **Meta description**: Present, unique, 150-160 chars, contains CTA
- **H1 tag**: Exactly one per page, contains primary keyword
- **Canonical URL**: Present and self-referencing (or correctly pointing)
- **Open Graph tags**: og:title, og:description, og:image present
- **Robots meta**: No accidental noindex/nofollow on important pages

### 2c. Image Audit
Use `seo_audit_images` to check:
- Missing alt text (flag every instance)
- Image file sizes > 200KB (suggest compression)
- Missing width/height attributes (CLS impact)
- Non-WebP formats that could be converted

### 2d. Link Audit
Use `seo_check_links` to identify:
- Broken internal links (404s)
- Broken external links
- Orphan pages (no internal links pointing to them)
- Pages with thin internal linking (< 3 internal links)

### 2e. Core Web Vitals
Use `seo_check_core_web_vitals` (requires PageSpeed API key):
- **LCP** (Largest Contentful Paint): Target < 2.5s
- **FID/INP** (Interaction to Next Paint): Target < 200ms
- **CLS** (Cumulative Layout Shift): Target < 0.1
- Flag any metric in "poor" range

### 2f. Structured Data Check
Use `seo_check_schema` to verify:
- Schema markup present and valid JSON-LD
- Correct schema type for page type (Product, Article, FAQ, etc.)
- No validation errors
- Missing recommended properties

### 2g. Sitemap & Robots
Use `seo_check_sitemap` and `seo_check_robots`:
- Sitemap.xml exists and is accessible
- All important pages included in sitemap
- No important pages blocked in robots.txt
- Sitemap submitted to search engines

## Step 3: Score & Prioritize

Calculate scores for each category (0-100):
- **Crawlability & Indexing**: Status codes, robots, sitemap
- **On-Page Elements**: Titles, descriptions, headers, canonicals
- **Content Quality Signals**: Internal linking, orphan pages
- **Performance**: Core Web Vitals scores
- **Structured Data**: Schema coverage and validity
- **Image Optimization**: Alt text, file sizes, formats

Overall score = weighted average:
- Crawlability: 25%
- On-Page: 25%
- Performance: 20%
- Content Signals: 15%
- Structured Data: 10%
- Images: 5%

## Step 4: Generate Report

Produce a structured audit report with:

1. **Executive Summary**: Overall score, top 3 critical issues, top 3 quick wins
2. **Detailed Findings**: Per-category breakdown with specific pages affected
3. **Action Items**: Prioritized list tagged as:
   - 🔴 Critical (blocking indexing or causing errors)
   - 🟡 Important (impacting rankings)
   - 🟢 Nice-to-have (incremental improvements)
4. **Auto-fixable Items**: List items that can be fixed via Webflow MCP

## Step 5: Store Results

If Supabase is available:
- Store the full audit in `seo_audits` table with timestamp
- Store individual issues in `seo_issues` table linked to audit ID
- This enables trend tracking across audits

## Step 6: Auto-Fix (if Webflow site)

For Webflow sites, offer to auto-fix:
- Missing/duplicate title tags → generate and push via Webflow API
- Missing meta descriptions → AI-generate and push
- Missing alt text → AI-generate descriptive alt text and push
- Missing schema markup → generate JSON-LD and inject via custom code

Always confirm with user before making bulk changes.

## Output Format

Present the report in a clean, scannable format. Use the scoring system above. End with a clear next-steps section that maps to the `/seo-fix` command for automated fixes.
