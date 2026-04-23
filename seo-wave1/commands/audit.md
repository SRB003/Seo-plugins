# SEO Audit

Run a full technical SEO audit on a website. This command uses the `seo-audit` skill to perform a comprehensive analysis.

## Usage

```
/seo-wave1:audit <site-url>
```

## What it does

1. Crawls the target site and discovers all pages
2. Checks meta tags (titles, descriptions, canonicals, OG tags) on every page
3. Audits images for missing alt text and oversized files
4. Identifies broken links (internal and external)
5. Checks Core Web Vitals via PageSpeed Insights API
6. Validates structured data / schema markup
7. Reviews sitemap.xml and robots.txt
8. Scores the site across 6 categories (0-100)
9. Produces a prioritized action list with severity tags
10. Stores results in Supabase for trend tracking

If this is a Webflow site, it will also identify which issues can be auto-fixed via the Webflow API.

## Required

- Site URL to audit

## Optional

- Google PageSpeed API key (for Core Web Vitals data)
- Webflow site connection (for auto-fix capabilities)
- Supabase connection (for storing audit history)

Run the audit using the `seo-audit` skill. Present findings in a clean scored report. End with the list of auto-fixable items and ask if the user wants to proceed with `/seo-wave1:fix`.
