---
name: citation-checker
description: Check NAP (Name, Address, Phone) consistency across business directories and citation sources. Use when the user asks about citation building, NAP consistency, directory listings, local citations, business directory audit, or listing accuracy. Also activates for "citation check", "NAP audit", "directory listings", "business directories", "listing consistency", or "local citations".
---

# Citation & NAP Consistency Checker

Audit business information consistency across the web — critical for local ranking trust signals.

## What is NAP Consistency?

NAP = Name, Address, Phone. Google uses NAP consistency across the web as a trust signal. Inconsistent NAP data (different phone numbers, old addresses, name variations) confuses Google and hurts local rankings.

## Priority Directories to Check

### Tier 1 (Critical — Google directly references these):
1. Google Business Profile (source of truth)
2. Bing Places for Business
3. Apple Maps Connect
4. Facebook Business Page
5. Yelp

### Tier 2 (Important — high authority citations):
6. Yellow Pages / YP.com
7. BBB (Better Business Bureau)
8. Foursquare
9. Nextdoor
10. TripAdvisor (hospitality/restaurants)
11. Justdial / Sulekha (India-specific)
12. IndiaMart (India B2B)

### Tier 3 (Industry-specific):
13. Industry-specific directories (Healthgrades, Avvo, Houzz, etc.)
14. Local chamber of commerce
15. Local business associations
16. Niche directories for the specific industry

## Audit Process

### Step 1: Establish Canonical NAP
Get the "correct" NAP from the user's GBP listing:
- **Name**: Exact legal business name (no keywords added)
- **Address**: Full formatted address with suite/unit
- **Phone**: Primary business phone number
- **Website**: Primary website URL

### Step 2: Search & Compare
Use `gmb_check_citations` tool to search for the business across directories:
1. Search by business name + city
2. Search by phone number
3. Search by address
4. For each directory found, extract the listed NAP data
5. Compare against canonical NAP

### Step 3: Flag Inconsistencies
For each directory listing, check:
- **Name**: Exact match? Has extra keywords? Abbreviated? Misspelled?
- **Address**: Same format? Old address? Missing suite number?
- **Phone**: Same number? Toll-free vs local? Tracking number confusion?
- **Website**: Correct URL? HTTP vs HTTPS? www vs non-www? Old domain?
- **Hours**: Match GBP hours?
- **Categories**: Aligned with GBP categories?

### Step 4: Score & Report
```
🔍 NAP CONSISTENCY REPORT — [Business Name]
   Canonical: [Name] | [Address] | [Phone]

   Directories Found: 18
   ✅ Consistent: 12 (67%)
   ⚠️ Partial Match: 4 (22%)
   ❌ Inconsistent: 2 (11%)

   Issues Found:
   - Yelp: Old phone number (555-0100 instead of 555-0200)
   - YP.com: Old address (123 Main instead of 456 Oak)
   - Facebook: Name has extra keyword ("Joe's Plumbing - Best Plumber NYC")
   - BBB: Missing suite number in address

   Missing From:
   - Apple Maps (not listed)
   - Bing Places (not claimed)
```

### Step 5: Generate Fix Plan
For each inconsistency:
- Link to the directory's edit/claim page
- Specify exactly what needs to change
- Priority order (Tier 1 first)
- Estimated time to fix

### Step 6: Track Over Time
Store in Supabase:
```
Table: seo_gmb_citations
- id, business_id, directory_name, directory_url, tier
- listed_name, listed_address, listed_phone, listed_website
- name_match, address_match, phone_match, website_match
- overall_status (consistent/partial/inconsistent/not_found)
- last_checked_at, created_at

Table: seo_gmb_citation_scores
- id, business_id, total_directories, consistent_count
- partial_count, inconsistent_count, not_found_count
- consistency_score, checked_at
```

## Duplicate Listing Detection

Also check for:
- Multiple GBP listings for the same business (merge or remove)
- Old listings at previous addresses (mark as closed)
- Fake or unauthorized listings using your business name
- Competitor listings with your phone number or address

Flag all duplicates for manual resolution (Google requires manual verification for duplicate removal).
