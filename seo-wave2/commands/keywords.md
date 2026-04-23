# Keyword Research

Discover and cluster keyword opportunities for a site or niche.

## Usage

```
/seo-wave2:keywords <site-url-or-niche> [--competitors url1,url2] [--geo us|in|global]
```

## What it does

1. Collects seed keywords from the site (if URL provided) or niche description
2. Expands seeds using autocomplete suggestions, modifier patterns, and question mining
3. Analyzes SERP competition and estimates difficulty for each keyword
4. Classifies intent (informational, transactional, commercial, navigational)
5. Clusters keywords by topic and maps to existing site pages
6. Identifies content gaps vs competitors
7. Scores and prioritizes clusters by volume, difficulty, and business relevance
8. Stores results in Supabase `seo_keywords` and `seo_keyword_clusters` tables

## Required

- Site URL or niche description

## Optional

- Competitor URLs (up to 3 — for gap analysis)
- Target geography (default: based on site TLD)
- Supabase connection (for persistent storage)

Uses the `keyword-research` skill. Outputs a prioritized cluster table and content gap list.
