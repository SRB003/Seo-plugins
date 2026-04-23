# Competitor Backlink Analysis

Reverse-engineer competitor backlink profiles and find link gaps.

## Usage

```
/seo-offpage:competitor-backlinks <your-domain> --competitor <competitor-domain>
```

## What it does

1. Discovers backlinks for both your domain and the competitor's
2. Identifies the link gap — domains linking to competitor but not you
3. Finds common linking domains between both sites
4. Discovers competitor's top-performing content by backlinks
5. Extracts replicable link building strategies from their profile
6. Prioritizes gap prospects by conversion probability
7. Stores analysis in Supabase `seo_competitor_backlink_analysis`

## Required

- Your domain
- Competitor domain

## Optional

- Multiple competitors (run sequentially)
- Supabase connection (for history)

Pairs with `/seo-offpage:link-intersections` for multi-competitor analysis and Wave 3 `/seo-wave3:outreach` for acting on gap opportunities.
