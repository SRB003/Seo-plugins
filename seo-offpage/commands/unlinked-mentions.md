# Find Unlinked Mentions

Discover brand mentions across the web that don't include a backlink.

## Usage

```
/seo-offpage:unlinked-mentions --brand "Brand Name" --domain yourdomain.com
```

## What it does

1. Searches for brand name mentions across the web (excluding your site)
2. Verifies each mention page doesn't already link to your domain
3. Scores mentions by conversion probability (domain quality, context, sentiment)
4. Tiers prospects: Tier 1 (80+), Tier 2 (60-79), Tier 3 (40-59)
5. Generates personalized outreach emails for each qualified mention
6. Stores mentions in Supabase `seo_unlinked_mentions` for tracking
7. Tracks outreach pipeline: discovered → contacted → converted

## Required

- Brand name
- Your domain

## Optional

- Additional search terms (product names, founder name)
- Maximum results
- Supabase connection (for tracking)
- Gmail connection (for outreach)

Pairs with Wave 3 `/seo-wave3:outreach` for email sending and `/seo-offpage:audit-backlinks` to verify new links appear in profile.
