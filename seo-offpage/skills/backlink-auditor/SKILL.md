---
name: backlink-auditor
description: Audit a domain's backlink profile including toxic link detection, anchor text distribution analysis, link velocity tracking, and disavow file generation. Use when the user asks about backlink health, toxic links, anchor text analysis, disavow files, link profile audit, backlink quality, or referring domain analysis. Also activates for "audit backlinks", "toxic links", "disavow file", "anchor text distribution", "backlink profile", "link quality", or "referring domains".
---

# Backlink Auditor

Comprehensive backlink profile analysis: discover referring domains, assess link quality, detect toxic links, analyze anchor text distribution, and generate disavow files.

## Audit Process

### Step 1: Discover Backlinks

Use `offpage_audit_backlinks` to scan the domain's backlink profile:

1. Search for pages mentioning and linking to the target domain
2. Collect referring domains, anchor text, and link attributes
3. Estimate dofollow/nofollow ratio

### Step 2: Toxic Link Detection

Assess each backlink for toxicity signals:

| Signal | Weight | Examples |
|--------|--------|----------|
| Spam domain patterns | High | Casino, pharma, payday loan keywords in domain |
| Suspicious TLDs | Medium | .xyz, .tk, .ml, .ga, .cf — commonly used by spam |
| Auto-generated domains | Medium | Extremely long domains, excessive hyphens |
| Link farm patterns | High | Sites with hundreds of outbound links, no real content |
| Irrelevant niche | Low | Completely unrelated industry with no editorial context |

**Toxicity Scoring** (0-100):
- **70-100**: Recommend disavow
- **40-69**: Monitor — may be harmless but warrants watching
- **0-39**: Safe — no action needed

### Step 3: Anchor Text Distribution

Classify every anchor text into types and analyze the distribution:

| Type | Healthy Range | Risk If Over |
|------|---------------|-------------|
| **Branded** (brand name, variations) | 30-50% | Rarely risky, but >70% means you're missing topical signals |
| **Exact match** (target keyword) | 5-15% | >30% triggers over-optimization penalty risk |
| **Partial match** (keyword + modifier) | 15-25% | >40% looks manipulative |
| **Generic** ("click here", "read more") | 5-15% | Usually harmless |
| **Naked URL** (raw URL as anchor) | 10-20% | Rarely risky |
| **Other** (random, image alt, etc.) | 5-15% | Noise — not a concern |

**Health Check Rules**:
- Exact-match anchors > 30% = **warning**: over-optimization risk
- Branded anchors < 20% = **warning**: consider brand-building links
- Any single anchor > 20% of total = **warning**: unnatural pattern

### Step 4: Disavow File Generation

If toxic links are found:
1. Generate a Google-format disavow file
2. Use domain-level disavow for highly toxic sites (score 80+)
3. Use URL-level disavow for moderately toxic pages
4. Include comments explaining each disavow entry
5. Advise user to review before submitting to Google Search Console

### Step 5: Store & Report

Save to Supabase:
```
Table: seo_backlink_audit
- id, domain, audit_date
- total_backlinks, referring_domains, dofollow_ratio
- anchor_distribution (JSONB)
- toxic_links_count, disavow_count
- health_score (0-100)
- full_results (JSONB)
```

### Step 6: Present Results

```
🔗 BACKLINK AUDIT — example.com
   Date: Mar 10, 2026

   📊 Profile Summary
   Total backlinks found:     234
   Referring domains:          87
   Dofollow ratio:            72%
   
   ⚓ Anchor Text Health
   Branded:       38% ✅
   Exact match:   12% ✅
   Partial match: 22% ✅
   Generic:        9% ✅
   Naked URL:     14% ✅
   Other:          5% ✅
   Overall: Healthy distribution

   ☠️ Toxic Links
   Disavow recommended:  3 links
   Monitor:              7 links
   Safe:                224 links

   📄 Disavow file generated — review before submitting
```

## Link Velocity Tracking

If historical data exists in Supabase:
1. Compare current snapshot to previous audits
2. Calculate new links gained per period
3. Calculate links lost per period
4. Flag sudden spikes (possible spam attack) or drops (possible content removal)
5. Track net link velocity trend

## Integration Points

- **Wave 3 outreach-engine**: Use toxic link findings to prioritize link recovery outreach
- **Wave 3 anomaly-detector**: Feed backlink changes into anomaly detection
- **seo-offpage competitor-backlink-analyzer**: Compare your profile to competitors
- **seo-offpage unlinked-mention-finder**: Find unlinked mentions to convert to clean links
