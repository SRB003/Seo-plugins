# Monitor Backlinks

Check and track the backlink profile for a site.

## Usage

```
/seo-wave3:backlinks <site-url> [--competitor competitor-url] [--compare]
```

## What it does

1. Analyzes the site's current backlink profile using `monitor_check_backlinks`
2. Extracts: referring domains, new links, lost links, anchor text distribution
3. If `--compare` flag: compares to last snapshot for changes
4. If `--competitor` URL provided: compares your backlink profile against theirs to find link gap opportunities
5. Flags toxic or suspicious backlinks
6. Stores snapshot in Supabase `seo_backlink_snapshots`
7. Identifies link-building opportunities for the outreach engine

## Required

- Site URL

## Optional

- Competitor URL (for link gap analysis)
- Compare to previous snapshot
- Supabase connection (for history)

Pairs with `/seo-wave3:outreach` to act on discovered opportunities.
