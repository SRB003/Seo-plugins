# Track Rankings

Check current keyword ranking positions and compare to historical data.

## Usage

```
/seo-wave3:ranks <site-url> [--keywords kw1,kw2,kw3] [--device mobile|desktop]
```

## What it does

1. Pulls tracked keywords from Supabase (or accepts a manual list)
2. Checks current SERP position for each keyword via SERP API
3. Compares to last recorded position to calculate movement
4. Flags significant drops (🔴), improvements (🟢), and new wins (⭐)
5. Stores all position data in Supabase `seo_rank_snapshots`
6. Generates a summary with position distribution and top movers
7. If critical drops detected, triggers anomaly detection automatically

## Required

- Site URL
- SERP API key (for reliable data)

## Optional

- Specific keywords to check (default: all tracked keywords for the site)
- Device type (default: mobile)
- Supabase connection (for historical comparison and storage)

Uses the `rank-tracker` skill. Run regularly (weekly recommended).
