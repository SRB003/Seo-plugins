---
name: local-post-writer
description: Create and schedule Google Business Profile posts including updates, offers, events, and product highlights. Use when the user asks to create GBP posts, schedule Google posts, write local content, create offers, promote events, or manage a posting calendar. Also activates for "Google post", "GBP post", "local post", "schedule post", "business update", or "weekly post".
---

# Local Post Writer

Generate engaging GBP posts optimized for local visibility and the AI-driven search landscape.

## Post Types

### 1. Update Posts
- Share news, tips, or behind-the-scenes content
- Include local relevance (mention city, neighborhood, local events)
- Add a relevant image + clear CTA button

### 2. Offer Posts
- Promote discounts, deals, or special pricing
- Include start/end dates for urgency
- Clear redemption instructions
- Strong CTA: "Claim Offer" or "Call Now"

### 3. Event Posts
- Promote upcoming events, workshops, or classes
- Include date, time, and location details
- Registration link or CTA

### 4. Product Highlight Posts
- Showcase specific products or services
- Include pricing if appropriate
- Link to product page or booking

## Writing Guidelines

### For Every Post:
- **Length**: 150-300 words (Google truncates longer posts)
- **First line hook**: Lead with the most compelling info
- **Local keywords**: Naturally include city name + service
- **CTA**: Every post needs a clear call-to-action
- **Image**: Required — high-quality, relevant, no text overlays
- **Hashtags**: 2-3 relevant local hashtags max
- **Freshness**: Posts expire after 7 days — post weekly minimum

### For AI/GEO Optimization (2026):
- Structure posts with clear, extractable facts
- Include specific details (hours, prices, addresses) that AI can pull
- Answer common customer questions within posts
- Use natural language that matches voice search queries
- Posts contribute to Gemini's "Ask Maps" feature responses

### Tone by Business Type:
- **Professional services** (law, medical, consulting): Authoritative, educational
- **Retail/e-commerce**: Exciting, benefit-focused, urgency-driven
- **Restaurants/hospitality**: Warm, inviting, sensory language
- **Home services** (plumbing, HVAC): Trustworthy, practical, seasonal

## Batch Post Generation

### Weekly Calendar Template:
```
Monday:    Service tip / educational content
Wednesday: Customer success story / review highlight
Friday:    Offer / promotion / weekend special
```

### Monthly Content Mix:
- 4 update posts (tips, news, behind-the-scenes)
- 2 offer posts (deals, seasonal promotions)
- 2 product/service highlights
- 1 event post (if applicable)
- 1 community/local engagement post

### Process:
1. Ask user for business type, key services, current promotions
2. Generate a month's worth of posts following the mix above
3. Include image descriptions/prompts for each post
4. Present for approval
5. Schedule via Google Calendar MCP (reminders to post)
6. Store in Supabase `seo_gmb_posts` table

## Post Performance Tracking

Store in Supabase:
```
Table: seo_gmb_posts
- id, business_id, post_type, content, image_description
- cta_type, cta_url, status (drafted/approved/posted/expired)
- posted_at, expires_at, views, clicks
- created_at
```

Track weekly: views, clicks, CTA engagement. Identify which post types perform best and adjust the content mix accordingly.
