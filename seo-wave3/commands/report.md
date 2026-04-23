# SEO Report

Generate a client-ready SEO performance report.

## Usage

```
/seo-wave3:report <site-url> [--type weekly|monthly|quarterly] [--format md|docx] [--email recipient@email.com]
```

## What it does

1. Aggregates data from all three wave Supabase tables:
   - Technical audit scores (Wave 1)
   - Content pipeline and scores (Wave 2)
   - Ranking positions and trends (Wave 3)
   - Backlink data (Wave 3)
   - Anomalies detected (Wave 3)
2. Generates the selected report type:
   - **Weekly**: Email digest with key metrics and alerts
   - **Monthly**: Full document with all sections, trends, and recommendations
   - **Quarterly**: Deep strategic analysis with 3-month trend data
3. Outputs in requested format (markdown or Word document)
4. Optionally emails the report via Gmail MCP
5. Creates next report reminder in Google Calendar

## Required

- Site URL
- Supabase connection (for historical data)

## Optional

- Report type (default: monthly)
- Output format (default: md)
- Email recipient (sends via Gmail MCP)
- Compare period (auto-selects based on report type)

Uses the `seo-reporter` skill. Integrates with docx skill for Word output.
