# Check Algorithm Updates

Check for recent Google algorithm updates and assess their impact on your site.

## Usage

```
/seo-wave3:update-check [--site site-url] [--period 30d|60d|90d]
```

## What it does

1. Searches for recent confirmed and suspected Google algorithm updates using `monitor_check_algorithm_updates`
2. For each update found:
   - Reports the update name, date, and confirmed/suspected status
   - Describes what the update targets (content quality, links, spam, etc.)
3. If a site URL is provided:
   - Cross-references update dates with ranking changes from Supabase
   - Identifies which keywords were affected during update windows
   - Assesses likely impact (positive, negative, neutral)
   - Recommends response actions based on update type

## Required

- None (shows all recent updates)

## Optional

- Site URL (for impact assessment)
- Look-back period (default: 30 days)

Pairs with `/seo-wave3:diagnose` for deep investigation of update impact.
