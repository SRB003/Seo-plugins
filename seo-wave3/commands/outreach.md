# Link Building Outreach

Discover link prospects and draft outreach emails.

## Usage

```
/seo-wave3:outreach <site-url> [--strategy guest_post|broken_link|resource|skyscraper] [--max-prospects 20]
```

## What it does

1. Based on strategy, discovers link building prospects:
   - **guest_post**: Finds sites in your niche accepting guest posts
   - **broken_link**: Finds broken links on relevant sites where your content fits
   - **resource**: Finds curated resource pages in your niche
   - **skyscraper**: Finds heavily-linked competitor content you can improve on
2. Qualifies prospects by relevance and quality
3. Finds contact information where available
4. Drafts personalized outreach emails for each prospect using the `outreach-engine` skill templates
5. Presents all emails for review
6. On approval, queues for sending via Gmail MCP
7. Schedules follow-ups in Google Calendar (5-7 days later)
8. Tracks everything in Supabase `seo_outreach_log`

## Required

- Site URL

## Optional

- Strategy type (default: guest_post)
- Max prospects to find (default: 20)
- Gmail MCP (for sending)
- Google Calendar MCP (for follow-up scheduling)

Uses the `outreach-engine` skill. All emails require explicit user approval before sending.
