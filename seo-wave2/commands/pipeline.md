# Content Pipeline

View and manage the full content pipeline — from keywords to published articles.

## Usage

```
/seo-wave2:pipeline [--site url] [--status all|pending|in_progress|published]
```

## What it does

1. Pulls the full content pipeline from Supabase:
   - Keyword clusters and their status
   - Content briefs (pending, approved, in progress)
   - Drafts (scored, pending review)
   - Published content (with SEO scores)
2. Presents a dashboard view:

```
╔══════════════════════════════════════════════════════════════╗
║                   CONTENT PIPELINE                          ║
╠══════════════════════════════════════════════════════════════╣
║ Keywords discovered: 247  │ Clusters formed: 32             ║
║ Briefs created: 12        │ Briefs pending: 8               ║
║ Drafts in progress: 4     │ Published: 6                    ║
║ Avg SEO score: 81/100     │ Next due: Mar 15                ║
╚══════════════════════════════════════════════════════════════╝
```

3. Shows the next 5 action items (highest priority unpublished content)
4. Option to run any pending action:
   - Generate brief for a keyword cluster → triggers `/seo-wave2:brief`
   - Draft content from a brief → triggers `/seo-wave2:write`
   - Score a draft → triggers `/seo-wave2:score`
   - Publish an approved draft → pushes to Webflow

## Required

- Supabase connection (this command reads from the pipeline tables)

## Optional

- Filter by site URL
- Filter by status

This is the master command for managing your content engine.
