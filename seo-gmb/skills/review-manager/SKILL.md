---
name: review-manager
description: Manage Google Business Profile reviews — draft responses, analyze sentiment, generate review request templates, and track reputation metrics. Use when the user asks about review management, responding to reviews, review generation, reputation management, customer feedback, or review strategy. Also activates for "respond to reviews", "review response", "get more reviews", "reputation management", "negative review", or "review strategy".
---

# Review Manager

Automate review response drafting, sentiment analysis, review request workflows, and reputation tracking.

## Module 1: Review Response Drafting

### Response Guidelines by Rating

**5-star reviews:**
- Thank by name if possible
- Reference the specific service/product mentioned
- Reinforce the positive experience
- Invite them back or mention other services
- Keep under 100 words
- Naturally include a service keyword

**4-star reviews:**
- Thank warmly
- Acknowledge what went well
- If they mentioned an issue, address it briefly
- Show commitment to improvement
- Keep under 100 words

**3-star reviews:**
- Thank for honest feedback
- Acknowledge concerns specifically
- Explain what you're doing to improve
- Invite them to contact you directly
- Keep professional and empathetic

**2-star and 1-star reviews:**
- Thank for feedback (never dismiss)
- Apologize for the experience without being defensive
- Address specific complaints factually
- Offer to resolve offline (provide contact info)
- NEVER argue, blame, or make excuses
- Keep calm, professional, and solution-oriented
- Under 150 words

### Response Templates

Generate personalized responses — NEVER use generic copy-paste templates. Each response should:
- Reference the reviewer's name
- Reference specifics from their review
- Feel genuine and human
- Include a relevant service keyword naturally (not forced)
- Have a unique tone (not identical to other responses)

### Batch Response Workflow

1. Pull all unresponded reviews via `gmb_get_reviews`
2. Analyze sentiment and rating for each
3. Draft personalized responses following guidelines above
4. Present all drafts for user approval
5. On approval, queue for posting (manual or via GBP interface)
6. Log in Supabase `seo_gmb_review_responses`

## Module 2: Sentiment Analysis

For each review, analyze:
- **Overall sentiment**: Positive / Neutral / Negative
- **Service mentions**: Which services are praised or criticized
- **Staff mentions**: Any team members named (positive or negative)
- **Common themes**: Patterns across multiple reviews
- **Keyword extraction**: Service-related terms customers use naturally

Aggregate into a sentiment dashboard:
```
📊 REVIEW SENTIMENT — [Business Name]
   Total Reviews: 156 | Avg Rating: 4.3★

   Sentiment Breakdown:
   😊 Positive: 78% | 😐 Neutral: 12% | 😟 Negative: 10%

   Top Praised: "friendly staff" (23x), "fast service" (18x), "clean facility" (14x)
   Top Criticized: "wait time" (8x), "parking" (5x), "pricing" (3x)

   Service Mentions:
   Equipment installation: 4.6★ avg (34 reviews)
   Maintenance service:   4.1★ avg (22 reviews)
   Customer support:      3.8★ avg (15 reviews)
```

## Module 3: Review Request System

### Email/SMS Templates for Review Requests

Generate personalized review request messages:

**Post-service email** (send 24-48 hours after service):
```
Subject: How was your experience with [Business]?

Hi [Customer Name],

Thank you for choosing [Business] for your [service]. We hope everything went well!

If you have a moment, we'd love to hear about your experience:
[Direct Google Review Link]

Your feedback helps us improve and helps others find great [service] in [City].

Thank you,
[Business Name]
```

**Follow-up** (if no response after 5 days):
```
Subject: Quick follow-up from [Business]

Hi [Customer Name],

Just a quick reminder — we'd really appreciate your feedback on your recent [service] with us.

It only takes 30 seconds: [Direct Google Review Link]

Thanks again for choosing us!
[Business Name]
```

### Review Generation Strategy
- Time requests for peak satisfaction (right after positive interaction)
- Make it frictionless (direct link to Google review, not homepage)
- Target 5+ new reviews per month minimum
- NEVER offer incentives for reviews (Google TOS violation)
- Train staff to ask happy customers in person

## Module 4: Reputation Monitoring

Track over time in Supabase:
```
Table: seo_gmb_reviews
- id, business_id, reviewer_name, rating, review_text
- sentiment, keywords_json, response_text, response_status
- reviewed_at, responded_at, created_at

Table: seo_gmb_review_metrics
- id, business_id, period, total_reviews, avg_rating
- new_reviews_count, response_rate, avg_response_time_hours
- sentiment_positive_pct, sentiment_negative_pct
- top_keywords_json, created_at
```

Alert via Gmail when:
- A 1-star or 2-star review is posted (respond ASAP)
- Review velocity drops below target
- Average rating drops below threshold
