# Content Calendar

Generate and manage a content publishing calendar from the keyword/brief pipeline.

## Usage

```
/seo-wave2:calendar [--weeks 4|8|12] [--frequency 2|3|4 per-week] [--site url]
```

## What it does

1. Pulls approved keyword clusters and briefs from Supabase
2. Prioritizes by: keyword difficulty (easy first), search volume, business relevance
3. Generates a publishing schedule:
   - Spreads content evenly across the time period
   - Alternates between content types (blog, guide, comparison, FAQ)
   - Groups related topics together for topical authority clustering
   - Assigns due dates based on frequency setting
4. For each calendar entry, shows:
   - Target keyword
   - Content type
   - Brief status (created / pending)
   - Draft deadline
   - Publish date
5. If Google Calendar MCP is connected:
   - Creates calendar events for each publish date
   - Adds brief summary and keyword in event description
   - Sets reminders 3 days before and 1 day before
6. If Gmail MCP is connected:
   - Option to email the full calendar to the team
7. Stores the calendar in Supabase `seo_content_calendar` table

## Required

- At least some keyword clusters or briefs in the Supabase pipeline
  (run `/seo-wave2:keywords` first if empty)

## Optional

- Weeks to plan (default: 4)
- Posts per week (default: 2)
- Site filter

Uses Google Calendar MCP for event creation and Gmail MCP for notifications.
