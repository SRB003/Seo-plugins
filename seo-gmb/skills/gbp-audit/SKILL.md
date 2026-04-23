---
name: gbp-audit
description: Audit a Google Business Profile for completeness, accuracy, and optimization opportunities. Use when the user asks to audit a GBP/GMB listing, check local SEO, review a Google Maps listing, assess local search readiness, or optimize a business profile. Also activates for "GMB audit", "GBP check", "local SEO audit", "Google Maps optimization", "business profile review", or "local listing check".
---

# Google Business Profile Audit

Comprehensive audit of a Google Business Profile covering all ranking factors for the local pack.

## Audit Checklist

### 1. Profile Completeness (25 points)

| Element | Points | Check |
|---------|--------|-------|
| Business name (accurate, no keyword stuffing) | 4 | Matches real-world signage exactly |
| Primary + secondary categories | 4 | Correct primary, all relevant secondaries set |
| Business description (750 chars, keywords) | 3 | Compelling, includes city + core service |
| Address / Service area | 3 | Accurate, consistent with website |
| Phone number (local, trackable) | 2 | Local area code, matches website |
| Website URL | 2 | Links to correct page (location page for multi-location) |
| Business hours (including special hours) | 3 | Complete with holiday hours set |
| Attributes (amenities, accessibility, etc.) | 2 | All relevant attributes checked |
| Services/menu listed | 2 | Full service list with descriptions |

### 2. Visual Content (15 points)

| Element | Points | Check |
|---------|--------|-------|
| Logo uploaded | 2 | High-quality, correct dimensions |
| Cover photo | 2 | Compelling, shows business |
| Interior photos (5+) | 3 | Recent, high-quality, varied |
| Exterior photos (3+) | 2 | Daylight, clear signage visible |
| Team/staff photos | 2 | Real people, professional |
| Product/service photos | 2 | Showcase offerings |
| Photo freshness (last 30 days) | 2 | At least 1 new photo per month |

### 3. Reviews & Reputation (25 points)

| Element | Points | Check |
|---------|--------|-------|
| Average rating ≥ 4.0 | 5 | Star rating across all reviews |
| Total review count (vs competitors) | 5 | Competitive with local top 3 |
| Review recency (last 30 days) | 5 | At least 2-3 new reviews per month |
| Owner response rate | 5 | 100% of reviews responded to |
| Response timeliness (< 24 hours) | 3 | Fast, personalized responses |
| Keyword presence in reviews | 2 | Customers naturally mention services |

### 4. Posts & Activity (15 points)

| Element | Points | Check |
|---------|--------|-------|
| Posting frequency (weekly+) | 5 | At least 1 post per week |
| Post variety (updates, offers, events) | 3 | Mix of post types |
| Post quality (image + CTA) | 3 | Every post has image and call-to-action |
| Post recency (last 7 days) | 2 | Active, fresh content |
| Q&A section populated | 2 | Common questions pre-answered |

### 5. NAP Consistency & Citations (10 points)

| Element | Points | Check |
|---------|--------|-------|
| NAP matches website exactly | 4 | Name, Address, Phone identical |
| NAP consistent across directories | 3 | Yelp, Facebook, Bing, Apple Maps, etc. |
| No duplicate listings | 3 | Single verified listing per location |

### 6. Website Local SEO Alignment (10 points)

| Element | Points | Check |
|---------|--------|-------|
| LocalBusiness schema on website | 3 | Matches GBP data exactly |
| Location page exists and is optimized | 3 | For each GBP location |
| Embedded Google Map on contact page | 2 | Links to correct listing |
| City + service in title/H1 | 2 | Local keyword targeting |

## Audit Process

### Step 1: Gather Data
1. Use `gmb_audit_profile` tool with the business name and location
2. Scrape the GBP listing data from Google Maps
3. Pull website data for NAP cross-reference
4. Check competitor profiles for benchmarking

### Step 2: Score Each Category
Run through all checklist items and assign scores.

### Step 3: Competitor Benchmarking
Use `gmb_analyze_local_pack` to:
- Check who currently ranks in the local 3-pack for target keywords
- Compare review counts, ratings, and posting frequency
- Identify what competitors do that you don't

### Step 4: Generate Report
```
📍 GBP AUDIT — [Business Name]
   Location: [City, State]
   Overall Score: [X]/100

   Profile Completeness:  [X]/25
   Visual Content:        [X]/15
   Reviews & Reputation:  [X]/25
   Posts & Activity:      [X]/15
   NAP & Citations:       [X]/10
   Website Alignment:     [X]/10

   🔴 Critical: [issues]
   🟡 Important: [issues]
   🟢 Quick Wins: [issues]

   Competitor Benchmark:
   You: 4.2★ (89 reviews) | #1: 4.5★ (234 reviews) | #2: 4.3★ (156 reviews)
```

### Step 5: Store & Track
Save to Supabase `seo_gmb_audits` for tracking improvement over time.

## Scoring Thresholds

| Score | Rating | Action |
|-------|--------|--------|
| 85-100 | Excellent | Maintain and monitor |
| 70-84 | Good | Address key gaps |
| 50-69 | Fair | Significant optimization needed |
| 0-49 | Poor | Complete overhaul required |
