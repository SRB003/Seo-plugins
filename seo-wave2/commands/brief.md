# Content Brief

Generate a detailed, writer-ready content brief for a target keyword.

## Usage

```
/seo-wave2:brief <keyword> [--site url] [--type blog|landing|comparison|faq|guide]
```

## What it does

1. Analyzes the top 10 SERP results for the keyword
2. Extracts competitor outlines, word counts, and content formats
3. Classifies the search intent from SERP evidence
4. Generates a full brief including:
   - Title tag and meta description suggestions
   - Complete H2/H3 outline
   - Target word count
   - Keyword placement map
   - Internal and external linking targets
   - Content differentiators
   - Featured snippet optimization (if applicable)
   - Schema markup recommendation
   - Media suggestions
5. Stores the brief in Supabase `seo_content_briefs` table
6. Optionally creates a Google Calendar event for the publish deadline
7. Optionally emails the brief to a writer via Gmail

## Required

- Target keyword

## Optional

- Site URL (for internal linking recommendations)
- Content type override (auto-detected from SERP if not set)
- Due date for calendar event
- Email recipient for the brief

Uses the `content-brief` skill. Run `/seo-wave2:keywords` first to identify target keywords.
