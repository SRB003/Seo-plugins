# Write Content

Draft a full SEO-optimized article or page from a content brief.

## Usage

```
/seo-wave2:write <keyword-or-brief-id> [--tone professional|conversational|technical] [--publish draft|live]
```

## What it does

1. Loads the content brief (from Supabase by brief ID, or generates one on the fly for a keyword)
2. Researches the SERP landscape for current ranking content
3. Drafts a complete article following the brief outline, keyword targets, and word count
4. Generates meta title, meta description, OG tags, and schema markup
5. Runs the draft through the content SEO scorer (targeting 75+ score)
6. Presents the full draft with:
   - SEO score breakdown
   - Keyword usage report
   - Metadata package
7. On approval, pushes to Webflow CMS as draft or live
8. Updates pipeline status in Supabase
9. Logs the publish in `seo_content_log`

## Required

- Target keyword or brief ID from Supabase

## Optional

- Tone directive (default: matches brief or auto-detects)
- Publish mode: `draft` (default) or `live`
- Webflow collection slug (auto-detected if site has one blog collection)

Uses `content-writer` and `content-scorer` skills together. Always scores before presenting.
