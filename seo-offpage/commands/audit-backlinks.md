# Audit Backlink Profile

Comprehensive backlink profile audit with toxic link detection and anchor text analysis.

## Usage

```
/seo-offpage:audit-backlinks <domain> --brand "Brand Name"
```

## What it does

1. Discovers backlinks using `offpage_audit_backlinks` via SERP analysis
2. Analyzes anchor text distribution and flags over-optimization risks
3. Detects toxic links using spam pattern matching and quality signals
4. Generates a Google-format disavow file for flagged links
5. Calculates link profile health score (0-100)
6. Stores snapshot in Supabase `seo_backlink_audit` for historical tracking
7. Compares to previous snapshot if available (link velocity)

## Required

- Domain to audit
- Brand name (for anchor text classification)

## Optional

- Compare to previous audit snapshot
- Generate disavow file
- Supabase connection (for history)

Pairs with `/seo-offpage:competitor-backlinks` for competitive comparison and `/seo-offpage:unlinked-mentions` for link building opportunities.
