# Digital PR Strategy

Discover PR opportunities and develop pitches for earning high-authority backlinks.

## Usage

```
/seo-offpage:digital-pr --niche "your industry" --brand "Brand Name"
```

## What it does

1. Scans for trending topics and recent news in your niche using `offpage_discover_pr_opportunities`
2. Categorizes opportunities: data stories, newsjacking, expert commentary, trend pieces, journalist queries
3. Generates pitch drafts for the most promising opportunities
4. Identifies target outlets and journalists
5. Creates a PR campaign plan with timeline
6. Stores campaign in Supabase `seo_pr_campaigns`
7. Tracks pitch → coverage → link conversion pipeline

## Required

- Niche/industry
- Brand name

## Optional

- Specific PR strategy focus (data_story, newsjack, expert, trend, haro)
- Target outlet type (news, industry, blog)
- Supabase connection (for tracking)
- Gmail connection (for pitch sending)
- Google Calendar (for scheduling)

Pairs with `/seo-offpage:unlinked-mentions` for monitoring resulting coverage mentions and `/seo-offpage:audit-backlinks` to verify earned links.
