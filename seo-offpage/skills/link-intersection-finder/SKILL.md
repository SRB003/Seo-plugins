---
name: link-intersection-finder
description: Find domains that link to 2 or more competitors but not to your site, representing the highest-probability link targets for outreach. Use when the user asks about link intersections, domains linking to competitors, shared competitor backlinks, common linkers, multi-competitor link analysis, or finding sites that link to everyone but you. Also activates for "link intersection", "who links to all my competitors", "shared backlinks", "common linkers", "competitor common links", "domains linking to competitors", or "link overlap".
---

# Link Intersection Finder

Find domains that link to multiple competitors but not to you — the highest-probability link building targets in any niche.

## Why Link Intersections Win

If a site links to **3 of your competitors**, they:
- Cover your niche (topical relevance confirmed)
- Are clearly willing to link to sites like yours
- Already know the space — no education needed
- Are **3x more likely** to link to you vs a cold prospect

Link intersection analysis is the single most efficient way to build a prospect list.

## Analysis Process

### Step 1: Define Competitor Set

Select 2-5 direct competitors:
- Choose competitors who rank for the same keywords
- Include competitors of different sizes (market leader + emerging players)
- Avoid including sites that are too different (e.g., news sites that happen to rank)

### Step 2: Discover Intersections

Use `offpage_find_link_intersections` to:

1. Discover backlinks for each competitor
2. Map all referring domains per competitor
3. Find domains appearing in 2+ competitor backlink profiles
4. Filter out domains that already link to you
5. Score each intersection by number of competitors linking and content type

### Step 3: Score & Tier

**Scoring Matrix**:
| Factor | Points | Why |
|--------|--------|-----|
| Links to 3+ competitors | +30 | Very high relevance and willingness |
| Links to 2 competitors | +15 | Good relevance |
| Resource/directory page | +15 | Easy to get added — they maintain link lists |
| Editorial/blog content | +10 | May accept guest posts or additions |
| Review/comparison content | +10 | Inclusion opportunity |
| Recent content (< 6 months) | +5 | Author is active and responsive |
| Already links to you | -50 | Not an intersection opportunity |

**Priority Tiers**:
```
🔴 Tier 1: Links to 3+ competitors (Score 80+)
   → Contact within this week — highest conversion probability

🟡 Tier 2: Links to 2 competitors (Score 60-79)
   → Contact in next outreach batch

🟢 Tier 3: Links to 1 competitor but high-quality (Score 40-59)
   → Queue for future outreach
```

### Step 4: Generate Pitch Angles

For each intersection, auto-generate a pitch angle based on the content type:

| Content Type | Pitch Approach |
|-------------|---------------|
| **Resource page** | "I noticed you list [Competitor A] and [Competitor B]. We offer [unique value]. Would you consider adding us?" |
| **Comparison/review** | "Your comparison of [A] vs [B] is great. We'd love to be included — here's what makes us different: [USP]" |
| **Guide/tutorial** | "Your guide references [A] and [B]. Our [tool/resource] complements their offerings with [specific benefit]" |
| **Blog post** | "Great article referencing [A] and [B]. We recently published [related content] that your readers might find valuable" |
| **Directory/list** | "I see you list several [niche] providers. We'd love to be considered for inclusion" |

### Step 5: Present Results

```
🔗 LINK INTERSECTION ANALYSIS
   Your domain: yourdomain.com
   Competitors: competitor1.com, competitor2.com, competitor3.com

   Intersections Found: 23 domains

   Priority Breakdown:
   🔴 Tier 1 (3+ competitors): 5 domains
   🟡 Tier 2 (2 competitors):  12 domains
   🟢 Tier 3 (1 competitor):   6 domains

   Top Intersection Opportunities:

   | # | Domain | Competitors | Type | Score | Pitch |
   |---|--------|-------------|------|-------|-------|
   | 1 | resource-hub.com | A, B, C | Resource | 95 | Submit for listing |
   | 2 | niche-review.com | A, C | Review | 88 | Request inclusion |
   | 3 | industry-blog.com | B, C | Blog | 82 | Pitch guest post |
   | 4 | tools-list.com | A, B | Directory | 78 | Submit site |
   | 5 | expert-guide.com | A, B | Guide | 75 | Suggest as reference |
```

### Step 6: Store Results

Save to Supabase:
```
Table: seo_link_intersections
- id, your_domain, competitors_analyzed (JSONB)
- intersection_domain, intersection_url, intersection_title
- links_to_competitors (JSONB)
- competitor_count, prospect_score
- pitch_angle, content_type
- outreach_status (discovered/contacted/follow_up/converted/declined)
- discovered_at, updated_at
```

## Multi-Round Analysis

For comprehensive intersection mapping:

**Round 1**: Direct competitors (same product/service)
**Round 2**: Adjacent competitors (same audience, different product)
**Round 3**: Content competitors (rank for same keywords but different business)

Each round reveals different linking audiences — Round 1 sites link because of product relevance, Round 3 sites link because of content quality.

## Action Handoff

After intersection analysis:
1. **Tier 1 prospects** → Immediately to `outreach-engine` for personalized email drafting
2. **Resource pages** → Direct submission outreach
3. **Review/comparison pages** → Pitch for inclusion with USP
4. **Blog/editorial pages** → Pitch guest post or content collaboration
5. Track all outreach in the `seo_outreach_log` table (shared with Wave 3)

## Ongoing Usage

- Re-run intersection analysis monthly to catch new competitor backlinks
- Compare intersection lists over time — shrinking gaps = your outreach is working
- New intersections that appear = competitor is actively building links in areas you should too
