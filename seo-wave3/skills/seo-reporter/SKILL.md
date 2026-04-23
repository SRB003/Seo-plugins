---
name: seo-reporter
description: Generate client-ready SEO performance reports from audit, ranking, and content data. Use when the user asks to create an SEO report, generate a client report, summarize SEO performance, create a monthly report, prepare an SEO review, or export SEO data. Also activates for "SEO report", "client report", "performance report", "monthly SEO review", "ranking report", or "progress report".
---

# SEO Report Generator

Produce comprehensive, client-ready SEO performance reports by aggregating data from all three waves.

## Data Sources

The reporter pulls from these Supabase tables (created by Wave 1-3):

| Table | Wave | Data |
|-------|------|------|
| `seo_audits` | Wave 1 | Technical audit scores and history |
| `seo_issues` | Wave 1 | Individual SEO issues per page |
| `seo_changes` | Wave 1 | On-page changes made (titles, descriptions, etc.) |
| `seo_keywords` | Wave 2 | Keyword database with metrics |
| `seo_keyword_clusters` | Wave 2 | Topic clusters and priorities |
| `seo_content_briefs` | Wave 2 | Content pipeline status |
| `seo_content_scores` | Wave 2 | Content quality scores |
| `seo_content_log` | Wave 2 | Content published |
| `seo_rank_snapshots` | Wave 3 | Keyword position history |
| `seo_backlink_snapshots` | Wave 3 | Backlink monitoring data |
| `seo_anomalies` | Wave 3 | Detected issues and resolutions |
| `seo_outreach_log` | Wave 3 | Link building outreach tracking |

## Report Types

### 1. Weekly Quick Report (Email Digest)

Short, high-signal summary sent via Gmail MCP:

```
Subject: SEO Weekly — [site] — Week of [date]

📊 Rankings: 22/45 keywords in top 10 (↑ from 19 last week)
📝 Content: 2 articles published, avg score 82/100
🔧 Technical: Site health score 91/100 (stable)
🔗 Backlinks: +3 new referring domains
⚠️ Alerts: "home gym equipment" dropped from #5 to #12

Top Win: "best resistance bands" entered top 3
Action Needed: Investigate "home gym equipment" ranking drop
```

### 2. Monthly Performance Report (Full Document)

Comprehensive report suitable for client delivery.

#### Report Structure:

**Cover Page**
- Client name / site URL
- Report period
- Prepared by: EBR Agency
- Date generated

**1. Executive Summary** (1 page)
- Overall SEO health score trend (line graph concept)
- Key metrics at a glance: rankings, traffic indicators, content output, backlinks
- Top 3 wins this month
- Top 3 priorities for next month
- ROI indicators (keywords gained, estimated traffic value)

**2. Technical SEO Health** (from Wave 1 data)
- Current audit score vs previous month
- Issues resolved this month
- Outstanding issues by severity
- Core Web Vitals trends
- Crawl health metrics

**3. Keyword Rankings** (from Wave 3 data)
- Total tracked keywords and position distribution
- Keywords by position bracket: 1-3, 4-10, 11-20, 21-30, 30+
- Month-over-month position changes
- Top movers (biggest gains and losses)
- New page 1 entries
- Estimated traffic value from current rankings

**4. Content Performance** (from Wave 2 data)
- Content published this month
- Content pipeline status (briefs pending, drafts in progress)
- Average content SEO score
- Content gap progress (% of competitor topics covered)
- Top-performing content pieces by ranking impact

**5. Backlink Profile** (from Wave 3 data)
- Total referring domains trend
- New backlinks acquired
- Lost backlinks
- Toxic link alerts
- Domain authority trend estimate
- Outreach results (sent, responses, links earned)

**6. Anomalies & Actions Taken** (from Wave 3 data)
- Detected ranking anomalies and probable causes
- Actions taken in response
- Algorithm update impact (if applicable)

**7. Recommendations & Next Month Plan**
- Priority keywords to target
- Content to create (from pipeline)
- Technical fixes still pending
- Outreach targets
- Strategy adjustments based on data

**Appendix**
- Full keyword ranking table
- Complete issue list
- Content score details

### 3. Quarterly Strategic Report

Deeper analysis for strategy meetings:
- All monthly report sections with 3-month trend data
- Competitor movement analysis
- Market share changes (share of voice estimates)
- Strategy effectiveness review (what worked, what didn't)
- Recommended strategy shifts
- Budget and resource allocation suggestions

## Report Generation Process

### Step 1: Collect Data
1. Query all relevant Supabase tables for the report period
2. Calculate period-over-period changes
3. Aggregate metrics into summary stats

### Step 2: Analyze Trends
1. Identify significant positive and negative trends
2. Correlate ranking changes with content/technical changes made
3. Detect patterns (e.g., certain content types performing better)
4. Compare against goals if set

### Step 3: Generate Insights
For each section, go beyond raw data:
- "Rankings improved because [specific change] was made on [date]"
- "The blog post about [topic] entered top 5 within 3 weeks of publishing"
- "Technical health improved after fixing [N] broken links on [date]"

### Step 4: Build the Report
1. Compile all sections using report template
2. For markdown format: generate clean, structured markdown
3. For document format: use docx skill to create a polished Word document
4. Include data visualizations where possible (tables, trend indicators)

### Step 5: Deliver
- **Gmail MCP**: Email the report to client / team
- **Google Calendar MCP**: Schedule the next report generation
- **Supabase**: Store report metadata in `seo_reports` table

## Automation

For hands-off reporting:
1. Store report schedule in Supabase `seo_report_schedule` table
2. Google Calendar events trigger report generation reminders
3. On trigger, auto-generate the appropriate report type
4. Auto-email via Gmail MCP to configured recipients
5. Log delivery in Supabase

## Multi-Client Support

When managing multiple client sites:
1. Each site has its own dataset in Supabase (filtered by `site_url`)
2. Generate individual reports per client
3. Generate a portfolio overview for agency internal use
4. Batch-email all client reports on a schedule
