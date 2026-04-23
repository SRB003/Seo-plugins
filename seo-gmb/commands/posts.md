# GBP Posts

Generate and schedule Google Business Profile posts.

## Usage
```
/seo-gmb:posts <business-name> [--weeks 4] [--type update|offer|event|product]
```

## What it does
1. Generates a batch of GBP posts following the weekly content mix
2. Each post includes: copy, image prompt, CTA, and scheduling recommendation
3. Creates Google Calendar reminders for posting days
4. Stores in Supabase for tracking

Uses the `local-post-writer` skill. Default generates 4 weeks of posts.
