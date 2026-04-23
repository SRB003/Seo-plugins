# SEO Fix

Auto-fix SEO issues identified by the audit. This command works with Webflow MCP to push changes directly.

## Usage

```
/seo-wave1:fix [--all | --titles | --descriptions | --alt-text | --schema | --links]
```

## What it does

Based on the most recent audit results (from Supabase or current session):

### `--titles`
- Generates optimized title tags for all flagged pages
- Shows before/after comparison
- On approval, pushes via Webflow MCP

### `--descriptions`
- Generates compelling meta descriptions with keywords and CTAs
- Shows before/after comparison
- On approval, pushes via Webflow MCP

### `--alt-text`
- AI-generates descriptive alt text for images missing it
- Contextualizes based on page content and surrounding text
- On approval, pushes via Webflow MCP

### `--schema`
- Auto-detects page types across the site
- Generates JSON-LD schema markup for each page
- Injects via Webflow custom code fields
- Validates after injection

### `--links`
- Identifies broken internal links and suggests fixes
- Finds orphan pages and suggests internal link insertions
- Provides anchor text recommendations

### `--all`
- Runs all of the above in sequence

## Safety

- ALL changes require user confirmation before pushing
- Old values are stored in Supabase `seo_changes` table for rollback
- URL slug changes are NEVER auto-applied (redirect setup required)
- A summary of all changes is presented before execution

Use the `onpage-optimizer` and `schema-generator` skills to execute fixes. Always confirm before pushing.
