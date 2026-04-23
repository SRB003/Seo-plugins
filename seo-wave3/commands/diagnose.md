# Diagnose SEO Anomalies

Detect and diagnose unusual SEO performance changes.

## Usage

```
/seo-wave3:diagnose <site-url> [--keyword specific-keyword] [--period 7d|14d|30d]
```

## What it does

1. Pulls recent ranking data from Supabase
2. Compares against historical baselines to detect anomalies:
   - Significant ranking drops (5+ positions)
   - Multiple keywords dropping simultaneously
   - New crawl errors detected
   - Core Web Vitals degradation
   - Backlink anomalies (sudden loss or toxic gains)
3. For each anomaly, runs through the diagnostic checklist:
   - Checks for Google algorithm updates
   - Checks for technical issues (4xx, robots, noindex)
   - Checks for recent content/site changes
   - Checks for backlink changes
   - Checks for competitor movements
4. Assigns probable cause with confidence level
5. Generates specific recommended actions
6. Stores anomaly in Supabase `seo_anomalies` table
7. Sends critical alerts via Gmail MCP

## Required

- Site URL

## Optional

- Specific keyword to investigate
- Look-back period (default: 7 days)
- Supabase connection (for historical data)

Uses the `anomaly-detector` skill. Also triggered automatically by `/seo-wave3:ranks` when drops are detected.
