---
name: rank-tracker
description: Track keyword ranking positions over time and detect movement. Use when the user asks to check rankings, track keyword positions, monitor SERP positions, see ranking changes, check where a page ranks, or compare ranking trends. Also activates for "rank tracking", "keyword positions", "where do I rank", "ranking report", "SERP position", or "position tracking".
---

# Rank Tracker

Monitor keyword ranking positions over time and detect significant movements.

## Tracking Process

### Step 1: Define Tracking Set

Determine which keywords to track:

1. **From Supabase pipeline**: Pull all keywords from `seo_keywords` table with status "published" or "tracking"
2. **Manual input**: User provides a list of keywords + target URLs
3. **From Wave 1 audit**: Keywords extracted from existing page titles and H1s
4. **From Wave 2 briefs**: Keywords from content briefs that have been published

For each keyword, store:
- The keyword phrase
- The target URL that should rank
- The target geography/locale
- The device type (mobile/desktop)

### Step 2: Check Current Positions

Use `monitor_check_rankings` tool for each keyword:

1. Search the keyword via SERP API (or direct scraping fallback)
2. Scan page 1-3 (positions 1-30) for the target domain
3. Record:
   - **Current position** (1-30, or "not found" if beyond page 3)
   - **URL that ranks** (may differ from target URL — flag if so)
   - **SERP features present** (featured snippet, PAA, local pack, etc.)
   - **Whether site owns any SERP features**
   - **Top competitor URLs** in positions above yours

### Step 3: Compare to Historical Data

If Supabase has previous ranking data:

1. Pull the last recorded position for each keyword
2. Calculate **position change** (Δ):
   - ↑ Positive = climbed (e.g., 8→5 = +3 improvement)
   - ↓ Negative = dropped (e.g., 5→12 = -7 drop)
   - → No change
3. Calculate **7-day trend** and **30-day trend** if enough data points exist
4. Flag significant movements:
   - **🔴 Alert**: Dropped 5+ positions
   - **🟡 Watch**: Dropped 2-4 positions
   - **🟢 Win**: Climbed 3+ positions
   - **⭐ New**: Entered top 10 for the first time
   - **💀 Lost**: Fell off page 1-3 entirely

### Step 4: Store Results

Save to Supabase:

```
Table: seo_rank_snapshots
- id, keyword_id, keyword, site_url, target_url
- ranking_url (actual URL that ranks), position
- previous_position, position_change
- serp_features, owns_feature
- device, locale, checked_at
```

### Step 5: Present Results

#### Quick Summary
```
📊 RANK TRACKING REPORT — example.com
   Tracked: 45 keywords | Date: Mar 10, 2026

   🟢 Improved:  12 keywords (avg +3.2 positions)
   → Stable:     25 keywords
   🟡 Watch:      5 keywords (avg -2.8 positions)
   🔴 Alert:      3 keywords (avg -7.3 positions)
   
   Top 3 positions: 8 keywords
   Top 10 positions: 22 keywords
   Page 1 (top 10):  49% coverage
```

#### Detailed Table
| Keyword | Position | Change | Trend | URL | Status |
|---------|----------|--------|-------|-----|--------|
| best gym equipment | 5 | ↑ +3 | 📈 | /products | 🟢 |
| home workout | 12 | ↓ -4 | 📉 | /blog/home-workout | 🟡 |

### Step 6: Trigger Actions

Based on ranking data:
- **Drops > 5 positions**: Flag for investigation in anomaly detector
- **New page 1 entries**: Celebrate & note what worked
- **Stagnant keywords** (no movement in 30 days): Flag for content refresh
- **Wrong URL ranking**: Flag cannibalization issue

## Batch Tracking

For tracking multiple sites (client portfolio):
1. Pull all tracked sites from Supabase
2. Run position checks for all keyword sets
3. Generate per-site summaries
4. Aggregate into a portfolio overview
5. Email individual reports via Gmail MCP

## Scheduling

If Google Calendar MCP is connected:
- Suggest weekly tracking cadence (every Monday)
- Create recurring calendar events as reminders
- Daily tracking is possible but uses more API quota
