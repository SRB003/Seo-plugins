# Find Link Intersections

Find domains that link to multiple competitors but not to you.

## Usage

```
/seo-offpage:link-intersections <your-domain> --competitors competitor1.com,competitor2.com,competitor3.com
```

## What it does

1. Discovers backlinks for each competitor domain
2. Maps all referring domains per competitor
3. Finds domains appearing in 2+ competitor backlink profiles
4. Filters out domains that already link to you
5. Scores each intersection by competitor count and content type
6. Generates pitch angles for each opportunity
7. Tiers results: Tier 1 (3+ competitors), Tier 2 (2 competitors)
8. Stores in Supabase `seo_link_intersections`

## Required

- Your domain
- At least 2 competitor domains (max 5)

## Optional

- Maximum results
- Supabase connection (for tracking)

Pairs with `/seo-offpage:competitor-backlinks` for deep-dive into individual competitors and Wave 3 `/seo-wave3:outreach` for outreach execution.
