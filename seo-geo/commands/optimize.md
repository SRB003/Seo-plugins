# GEO Optimize

Apply GEO techniques to content for maximum AI engine visibility.

## Usage
```
/seo-geo:optimize <url-or-content> --keyword <keyword> [--techniques all|citations|stats|quotes|fluency]
```

## What it does
1. Audits current GEO score
2. Applies selected techniques: adds citations, inserts statistics, adds expert quotes, optimizes fluency
3. Presents before/after with estimated visibility improvement
4. For Webflow sites, pushes optimized content on approval

Uses `geo-content-optimizer` skill. Default applies all techniques.
