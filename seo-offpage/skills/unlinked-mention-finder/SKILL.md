---
name: unlinked-mention-finder
description: Discover brand mentions across the web that don't include a backlink, prioritize by domain authority and conversion likelihood, and generate outreach templates to convert mentions into links. Use when the user asks about unlinked mentions, brand mentions without links, mention monitoring, converting mentions to links, or brand mention outreach. Also activates for "unlinked mentions", "brand mentions", "mentions without links", "convert mentions", "mention outreach", "who mentions me", or "find mentions".
---

# Unlinked Mention Finder

Discover web pages that mention your brand but don't link to your site — then convert them into backlinks with targeted outreach.

## Why Unlinked Mentions Matter

Unlinked mentions are the **highest-conversion link building opportunity** because:
- The author already knows your brand
- They've already written about you (positive editorial signal)
- You're asking them to add a link, not create new content
- Typical conversion rate: **15-25%** (vs 3-5% for cold outreach)

## Discovery Process

### Step 1: Search for Mentions

Use `offpage_find_unlinked_mentions` with your brand name and domain:

1. Search for brand name mentions excluding your own site
2. Search for product/service name variations
3. Search for founder/CEO name mentions (if relevant)
4. Search for common misspellings of the brand name
5. Filter out results that already link to your domain

**Search Variations to Run**:
```
"[Brand Name]" -site:yourdomain.com
"[Product Name]" -site:yourdomain.com
"[Brand Name] review" -site:yourdomain.com
"[Brand Name]" mentioned -site:yourdomain.com
"[Brand Name]" recommended -site:yourdomain.com
```

### Step 2: Verify Mentions

For each potential mention:
1. Fetch the page and check if it actually mentions the brand
2. Verify there's no existing link to your domain
3. Check that the mention is substantive (not just a passing word)
4. Verify the page is live and indexable (not noindex, not 4xx)

### Step 3: Score & Prioritize

Each unlinked mention gets a prospect score (0-100):

| Factor | Points | Condition |
|--------|--------|-----------|
| Brand in page title | +15 | Direct mention in `<title>` or H1 |
| Multiple mentions | +10 | Brand appears 2+ times on page |
| Positive context | +10 | "recommend", "best", "top", "guide" nearby |
| Editorial content | +10 | Blog, article, guide (vs forum, comment) |
| High-authority domain | +10 | Established publication or industry site |
| Recent content | +5 | Published in last 6 months |
| Negative context | -20 | "complaint", "avoid", "scam" nearby |
| No-index page | -30 | Page won't pass SEO value |

**Priority Tiers**:
- **Tier 1 (Score 80+)**: Outreach immediately — high conversion probability
- **Tier 2 (Score 60-79)**: Outreach in next batch — good prospects
- **Tier 3 (Score 40-59)**: Low priority — outreach if time permits
- **Below 40**: Skip — not worth the effort

### Step 4: Generate Outreach

For each qualified mention, draft a personalized email:

**Unlinked Mention Email Template**:
```
Subject: Thanks for mentioning [Brand Name]!

Hi [Name],

I came across your [article/page title] and wanted to say thanks for mentioning [Brand Name] in the [section/context where it appears].

Would you consider adding a link to [target URL] where you mention us? It would help your readers find more information about what you're describing.

Either way, appreciate the mention!

[Your name]
[Brand Name]
```

**Key Outreach Rules**:
1. **Thank first, ask second** — gratitude opens doors
2. **Be specific** — reference the exact page and section
3. **Suggest the target URL** — don't make them search for it
4. **Keep it short** — under 100 words
5. **One ask** — just the link, nothing else

### Step 5: Track & Follow Up

Store in Supabase:
```
Table: seo_unlinked_mentions
- id, brand_name, domain
- mention_url, mention_domain, mention_title
- mention_context, prospect_score
- contact_email, contact_name
- outreach_status (discovered/contacted/follow_up/converted/declined/no_response)
- outreach_sent_at, follow_up_sent_at
- link_added (boolean), link_url
- discovered_at, updated_at
```

**Follow-up Rules**:
- Wait 5-7 days after initial email
- Maximum 1 follow-up (these are warm leads, not cold prospects)
- If no response after follow-up, mark as no_response and move on
- NEVER be aggressive — they don't owe you a link

### Step 6: Report

```
🔍 UNLINKED MENTION REPORT — [Brand Name]

Mentions discovered:     34
Already linked:          12 (35%)
Unlinked mentions:       22

By Priority:
  Tier 1 (Score 80+):    5 mentions  ← contact immediately
  Tier 2 (Score 60-79):  9 mentions
  Tier 3 (Score 40-59):  8 mentions

Outreach Pipeline:
  Contacted:              8
  Responded:              3 (38% response rate)
  Links added:            2 (25% conversion rate)
  Pending follow-up:      5

Top Unlinked Mentions:
| Page | Domain | Score | Context |
|------|--------|-------|---------|
| "Best Tools for X" | nichesite.com | 92 | Recommends [Brand] by name |
| "Review: Top 5 Y" | reviewblog.com | 85 | Full paragraph about [Brand] |
```

## Ongoing Monitoring

Set up recurring mention monitoring:
1. Run mention discovery weekly or bi-weekly
2. Track new mentions automatically
3. Alert when high-priority (Score 80+) unlinked mentions are found
4. Automatically draft outreach for new discoveries
5. Track conversion rates over time to optimize templates

## Integration Points

- **Wave 3 outreach-engine**: Hand off qualified mentions for email drafting and sending
- **Wave 3 anomaly-detector**: Sudden spike in negative mentions may indicate a PR issue
- **seo-offpage backlink-auditor**: Cross-reference — mentions that become links should appear in audits
- **Gmail MCP**: Send outreach emails
- **Google Calendar MCP**: Schedule follow-ups
