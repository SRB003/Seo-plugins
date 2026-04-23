# Score Content

Score existing content or a draft against SEO best practices.

## Usage

```
/seo-wave2:score <url-or-text> --keyword <primary-keyword> [--secondaries kw1,kw2,kw3]
```

## What it does

1. Fetches the content (from URL, Webflow CMS, or accepts pasted text)
2. Parses into components: headings, paragraphs, sentences, words
3. Scores across 6 categories (100 total):
   - Keyword Optimization (25)
   - Content Structure (20)
   - Readability (20)
   - Technical SEO (15)
   - Content Quality (10)
   - Engagement Elements (10)
4. Produces a visual score breakdown with issue list
5. Categorizes issues as critical, improvements, and nice-to-haves
6. If score < 75, recommends specific fixes

## Required

- Content (URL, Webflow page, or pasted text)
- Primary keyword

## Optional

- Secondary keywords (for deeper keyword coverage analysis)
- Target word count (to check coverage)

Uses the `content-scorer` skill. Pair with `/seo-wave2:write` to fix issues.
