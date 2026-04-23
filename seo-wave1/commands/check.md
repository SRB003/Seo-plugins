# SEO Check

Quick single-page SEO check. Lightweight version of the full audit.

## Usage

```
/seo-wave1:check <page-url>
```

## What it does

For a single URL, quickly checks:
- Title tag (present, length, keyword)
- Meta description (present, length, CTA)
- H1 (present, count, keyword)
- Canonical URL
- Open Graph tags
- Schema markup presence
- Image alt text coverage
- Page load time / Core Web Vitals
- Internal link count (to and from this page)

Presents a quick scorecard and flags issues. Useful for checking a page before publishing or after making changes.

No Supabase storage — this is a fast, lightweight check.
