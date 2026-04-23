# SEO Dashboard

Master overview of all SEO metrics across all three waves for a site or portfolio.

## Usage

```
/seo-wave3:dashboard [--site site-url] [--all-sites]
```

## What it does

1. Pulls the latest data from all Supabase tables across Wave 1, 2, and 3
2. Presents a unified dashboard:

```
╔══════════════════════════════════════════════════════════╗
║           SEO DASHBOARD — example.com                    ║
║           Last updated: Mar 10, 2026                     ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  🔧 TECHNICAL HEALTH         📊 RANKINGS                ║
║  Audit Score:   91/100       Tracked Keywords: 45        ║
║  Issues Open:   7            In Top 3:    8              ║
║  CWV Status:    ✅ Good       In Top 10:  22 (49%)       ║
║                              In Top 30:  38 (84%)       ║
║  📝 CONTENT PIPELINE         Position Trend: ↗ +2.1 avg ║
║  Published:     18                                       ║
║  In Progress:    4           🔗 BACKLINKS                ║
║  Briefs Ready:   6           Referring Domains: 142      ║
║  Avg Score:     82/100       New This Month:  +8         ║
║                              Lost This Month: -2         ║
║  ⚠️ ANOMALIES                                            ║
║  Active Alerts:  1 (ranking drop on 3 keywords)          ║
║  Resolved:      12 this month                            ║
║                                                          ║
║  📧 OUTREACH                                             ║
║  Active Campaigns: 2                                     ║
║  Emails Sent:     28                                     ║
║  Links Won:        3                                     ║
║  Response Rate:   29%                                    ║
╚══════════════════════════════════════════════════════════╝
```

3. If `--all-sites` flag: shows portfolio overview across all tracked sites
4. Highlights the single most important action item to take next
5. Links to relevant commands for each section

## Required

- Supabase connection (reads from all Wave 1-3 tables)

## Optional

- Specific site URL (default: all sites)
- All-sites portfolio view

This is the go-to command for a quick overview of any site or your entire portfolio.
