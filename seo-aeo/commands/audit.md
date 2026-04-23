# AEO Audit

Audit a page or site for Answer Engine Optimization readiness.

## Usage
```
/seo-aeo:audit <url> --keyword <target-keyword>
```

## What it does
1. Checks answer-first content structure (are answers up front?)
2. Verifies question-format headings match user queries
3. Measures fact density and citation quality
4. Checks E-E-A-T signals (author, expertise, sourcing)
5. Validates AEO-relevant schema (FAQ, HowTo, Speakable, QAPage)
6. Assesses content freshness
7. Scores against the 130-point combined SEO+AEO scorecard
8. Compares against current featured snippet holder for the keyword

Uses the `answer-optimizer` skill.
