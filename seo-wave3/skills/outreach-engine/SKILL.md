---
name: outreach-engine
description: Automate link-building outreach including prospect discovery, email drafting, follow-up management, and response tracking. Use when the user asks about link building, backlink outreach, guest posting, broken link building, link prospecting, outreach emails, or building authority. Also activates for "link building", "outreach campaign", "get backlinks", "guest post", "broken link building", "outreach email", or "link prospects".
---

# SEO Outreach Engine

Semi-automated link-building outreach: discover prospects, draft personalized emails, manage follow-ups, and track results.

## Outreach Strategies

### Strategy 1: Guest Post Outreach

**Goal**: Publish articles on relevant external sites with links back to your content.

**Process**:
1. **Prospect Discovery**: Use `monitor_find_link_prospects` to find sites that:
   - Cover topics in your niche
   - Accept guest posts (look for "write for us", "contribute", "guest post" pages)
   - Have decent domain authority signals (established sites, not spam)
   - Don't already link to you (no value in duplicate)

2. **Qualification**: For each prospect, assess:
   - Relevance to your niche (high / medium / low)
   - Site quality (check for real content, not a link farm)
   - Contact information available
   - Recent publishing activity (active sites only)

3. **Email Draft**: Generate a personalized pitch:
   - Reference a specific article they published (shows you actually read their site)
   - Propose 2-3 specific topic ideas relevant to their audience
   - Brief author bio showing expertise
   - Keep it under 150 words — nobody reads long pitches

4. **Follow-up**: If no response in 5-7 days, draft a brief follow-up.

### Strategy 2: Broken Link Building

**Goal**: Find broken links on relevant sites and offer your content as a replacement.

**Process**:
1. **Find Broken Links**: Use `monitor_find_broken_links_on_site` to crawl relevant sites and find 404s
2. **Match Content**: Check if you have content that could replace the broken link
3. **Email Draft**: Notify the site owner about the broken link and suggest your content as a replacement
   - Lead with value (helping them fix their site)
   - Mention the specific broken link and the page it's on
   - Offer your content as an alternative resource

### Strategy 3: Resource Page Link Building

**Goal**: Get listed on curated resource pages in your niche.

**Process**:
1. **Find Resource Pages**: Search for "[niche] resources", "[niche] useful links", "best [niche] websites"
2. **Qualify**: Must be genuine resource pages (not link directories)
3. **Email Draft**: Request inclusion with a clear value proposition for their readers

### Strategy 4: Skyscraper Technique

**Goal**: Find content with lots of backlinks, create something better, and reach out to linkers.

**Process**:
1. Use `monitor_check_backlinks` on competitor pages to find heavily-linked content
2. Create superior content using Wave 2 tools (better, more comprehensive, more current)
3. Reach out to sites linking to the inferior version and offer your improved resource

### Strategy 5: Journalist/PR Outreach

**Goal**: Get press mentions and links from news/media sites.

**Process**:
1. Monitor for relevant journalist queries (HARO-style)
2. Draft expert response pitches
3. Send via Gmail with quick turnaround

## Email Templates

### Guest Post Pitch
```
Subject: Content idea for [Site Name]: [Specific Topic]

Hi [Name],

I enjoyed your recent article on [specific article title] — especially the point about [specific detail].

I write about [your niche] and thought your readers might find value in a piece about [topic idea]. Specifically, I'd cover:

- [Angle 1]
- [Angle 2]  
- [Angle 3]

I've published on [credibility reference]. Happy to share a sample or outline.

[Your name]
[Your site]
```

### Broken Link Alert
```
Subject: Broken link on your [topic] page

Hi [Name],

I was reading your [page title] article and noticed a broken link in the [section] section — the link to [anchor text] returns a 404.

I recently published a comprehensive guide on the same topic that could work as a replacement: [your URL]

Either way, wanted to flag the broken link. Great resource otherwise!

[Your name]
```

### Follow-up (5-7 days)
```
Subject: Re: [original subject]

Hi [Name],

Just floating this back up — I know inboxes get busy. Would love to discuss the [topic] idea if you're interested.

No worries if not a fit!

[Your name]
```

## Outreach Pipeline Management

### Status Tracking
Store in Supabase:
```
Table: seo_outreach_log
- id, site_url, campaign_type (guest_post/broken_link/resource/skyscraper/pr)
- prospect_domain, prospect_url, contact_email, contact_name
- relevance_score, quality_score
- email_subject, email_body, email_sent_at
- follow_up_sent_at, follow_up_count
- status (prospect/contacted/follow_up/responded/won/lost/no_response)
- link_url (if won), link_anchor_text
- notes, created_at, updated_at
```

### Pipeline Dashboard
```
📧 OUTREACH PIPELINE — example.com

Prospects found:    45
Emails sent:        28
Follow-ups sent:    12
Responses:           8 (29% response rate)
Links won:           3 (11% conversion)
Avg response time:   3.2 days

Active campaigns:
  Guest Posts:       15 contacted, 2 won
  Broken Links:       8 contacted, 1 won
  Resource Pages:     5 contacted, 0 won

Pending follow-ups:  6 (next batch due Mar 12)
```

### Automation Rules
1. **Auto-prospect**: Run prospect discovery weekly for active campaigns
2. **Auto-draft**: Generate personalized emails for new prospects
3. **Auto-follow-up**: Draft follow-up emails for non-responses after 5-7 days
4. **Auto-report**: Include outreach stats in weekly/monthly reports

All emails are drafted and queued — sending requires user approval via Gmail MCP.

## Safety & Ethics

- NEVER send emails without user review and approval
- NEVER misrepresent who you are or your relationship to a site
- NEVER spam — maximum 2 follow-ups per prospect
- NEVER buy links or participate in link schemes
- Always provide genuine value in outreach
- Respect unsubscribe/no-response signals
- Comply with CAN-SPAM and equivalent regulations
