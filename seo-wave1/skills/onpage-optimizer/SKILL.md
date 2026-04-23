---
name: onpage-optimizer
description: Optimize on-page SEO elements for a website or specific pages. Use when the user asks to optimize title tags, meta descriptions, headers, internal links, URL slugs, or any on-page SEO element. Also activates for "optimize pages", "fix meta tags", "improve SEO", "bulk update titles", or "internal linking".
---

# On-Page SEO Optimizer

Systematically optimize on-page elements for maximum search visibility. This skill works best with Webflow MCP for direct publishing and Supabase MCP for tracking changes.

## Optimization Modules

### Module 1: Title Tag Optimization

For each page, generate an optimized title tag:

**Rules:**
- Max 60 characters (Google truncates at ~60)
- Primary keyword near the front
- Brand name at the end, separated by ` | ` or ` — `
- Unique across all pages (no duplicates)
- Action-oriented where appropriate

**Formula:** `[Primary Keyword] [Modifier] | [Brand Name]`

**Process:**
1. Pull all current titles via Webflow MCP or `seo_audit_meta_tags`
2. Identify: missing titles, duplicates, too-long, too-short, keyword-missing
3. Generate optimized versions for each flagged page
4. Present as a before/after comparison table
5. On approval, bulk-push via Webflow MCP `webflow_update_page_seo`

### Module 2: Meta Description Optimization

**Rules:**
- 150-160 characters
- Contains primary keyword naturally
- Includes a call-to-action or value proposition
- Unique per page
- Reads as compelling ad copy (this is your SERP pitch)

**Process:**
1. Audit all current descriptions
2. Flag: missing, duplicate, too-long, too-short, no-CTA
3. Generate optimized versions with keyword + CTA
4. Present for review
5. Bulk-push via Webflow MCP

### Module 3: Header Tag Restructuring

**Rules:**
- Exactly ONE H1 per page containing primary keyword
- H2s for main sections (target secondary keywords)
- H3s for subsections
- No skipped levels (H1 → H3 without H2)
- Headers should form a logical outline

**Process:**
1. Pull header hierarchy for each page via `seo_audit_meta_tags`
2. Flag: missing H1, multiple H1s, skipped levels, keyword-free H1
3. Suggest restructured hierarchy
4. For Webflow CMS items, update via API

### Module 4: Internal Linking Automation

**Rules:**
- Every page should have 3+ internal links pointing TO it
- Use descriptive anchor text (not "click here")
- Link contextually relevant pages
- Distribute link equity to priority pages
- Don't over-link (max 100 links per page)

**Process:**
1. Build a full site link map using `seo_crawl_site`
2. Identify orphan pages (0 internal links)
3. Identify low-linked priority pages
4. For each under-linked page, find contextually relevant pages that mention related terms
5. Suggest specific link insertions: [source page] → [anchor text] → [target page]
6. For Webflow CMS rich text fields, inject links via API

### Module 5: URL Slug Optimization

**Rules:**
- Lowercase, hyphens only (no underscores or spaces)
- Contains primary keyword
- Short and descriptive (3-5 words ideal)
- No stop words unless needed for readability
- No dates unless the content is truly time-sensitive

**Process:**
1. Audit all current slugs
2. Flag: too-long, missing-keyword, contains-stop-words, contains-dates
3. Suggest optimized slugs
4. ⚠️ IMPORTANT: Changing slugs requires 301 redirects. Always set up redirects before changing.
5. Update via Webflow MCP with redirect rules

### Module 6: Image Alt Text Generation

**Rules:**
- Descriptive and specific (not "image1.jpg")
- Contains keyword where natural (don't stuff)
- Under 125 characters
- Describes what the image shows for accessibility
- Skip decorative images (empty alt="")

**Process:**
1. Pull all images via `seo_audit_images`
2. For images with missing/generic alt text, analyze page context
3. Generate descriptive alt text using page topic + image position
4. Push via Webflow MCP asset/CMS update

## Execution Workflow

When the user invokes this skill:

1. **Scope**: Ask which modules to run (all, or specific ones)
2. **Target**: All pages, specific collection, or specific URLs
3. **Analyze**: Run selected modules
4. **Present**: Show before/after comparison for each change
5. **Confirm**: Get user approval (all changes, or selective)
6. **Execute**: Push approved changes via Webflow MCP
7. **Log**: Store all changes in Supabase `seo_changes` table with timestamps

## Safety Rails

- NEVER change URL slugs without confirming redirect setup
- NEVER push changes without user approval
- Always preserve existing good optimization (don't overwrite strong titles)
- Keep a rollback log in Supabase (store old values before overwriting)
