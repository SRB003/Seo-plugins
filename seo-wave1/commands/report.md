# SEO Report

Generate a client-ready SEO report from audit data stored in Supabase.

## Usage

```
/seo-wave1:report <site-url> [--format md|docx] [--compare]
```

## What it does

1. Pulls the latest audit data from Supabase `seo_audits` table
2. If `--compare` flag is set, pulls previous audit for trend comparison
3. Generates a formatted report with:
   - Overall SEO health score (0-100)
   - Category breakdown with scores
   - Critical issues requiring attention
   - Changes made since last audit (if `--compare`)
   - Score trend over time (if multiple audits exist)
   - Next recommended actions
4. Outputs as markdown or Word document

## Use Case

Run this after completing an audit and fix cycle to produce a deliverable for clients. The report pulls from Supabase, so it reflects the most recent state.

If Supabase is not connected, generate the report from the current session's audit data instead.
