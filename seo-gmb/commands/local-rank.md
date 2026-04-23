# Local Pack Ranking

Check local pack position for target keywords in a specific location.

## Usage
```
/seo-gmb:local-rank <business-name> --keywords "kw1,kw2,kw3" --city <city>
```

## What it does
1. Searches each keyword + city combination
2. Checks if the business appears in the local 3-pack
3. Records position (1-3 in pack, or not in pack)
4. Shows who else is in the pack for each keyword
5. Compares to previous checks for movement tracking
6. Stores in Supabase `seo_gmb_rank_snapshots`

Pairs with `/seo-gmb:audit` for a complete local SEO picture.
