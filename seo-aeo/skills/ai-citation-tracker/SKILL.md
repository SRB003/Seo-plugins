---
name: ai-citation-tracker
description: Track and measure brand/content visibility across AI answer engines (ChatGPT, Perplexity, Google AI Overviews, Gemini). Use when the user asks about AI visibility, AI citations, brand mentions in AI, share of voice in AI search, LLM visibility, or monitoring AI references. Also activates for "AI citation", "AI visibility", "ChatGPT mentions", "Perplexity citations", "AI share of voice", "LLM tracking", or "AI brand monitoring".
---

# AI Citation Tracker

Measure and improve your brand's visibility across AI answer engines.

## What We Track

### Key Metrics

1. **AI Share of Voice (SOV)**: Percentage of relevant AI queries where your brand is mentioned
2. **Citation Rate**: Percentage of AI answers that link to your domain
3. **Mention Sentiment**: Whether your brand is mentioned positively, neutrally, or negatively
4. **Entity Accuracy**: Whether AI presents your brand/product information correctly
5. **Citation Frequency**: Total mentions across platforms per period
6. **Time-to-Citation**: Days from content publish to first AI citation

### Platforms to Monitor
- ChatGPT (search mode) — ~70% market share
- Google AI Overviews — largest reach via Google
- Perplexity — highest citation click-through rates
- Gemini — growing via Google integration
- Microsoft Copilot — enterprise search

## Monitoring Process

### Step 1: Define Brand Queries
Identify the prompts/questions that matter for your business:
- "[Industry] + [service]" queries ("best gym equipment for home")
- Brand comparison queries ("[Your brand] vs [Competitor]")
- Category leadership queries ("who is the best [service] in [city]")
- Product-specific queries ("is [product] worth it")
- Recommendation queries ("recommend a [service] for [use case]")

### Step 2: Test AI Responses
Use `aeo_test_ai_visibility` tool to:
1. Send each brand query to available AI search endpoints
2. Check if your brand/domain appears in the response
3. Extract the context of any mention (positive/negative/neutral)
4. Check if your domain is linked as a source
5. Note which content of yours was referenced

### Step 3: Analyze Citation Patterns
For mentions found:
- Which content types get cited most? (guides, comparisons, data)
- Which domains appear alongside yours? (competitor landscape)
- What phrasing does AI use when referencing your brand?
- Are there factual errors in how AI represents you?

For no mentions:
- Who IS being cited instead?
- What do they have that you don't? (data, authority, recency)
- Is it a content gap or an authority gap?

### Step 4: Report

```
🤖 AI VISIBILITY REPORT — [Brand Name]
   Period: [Date Range]

   AI Share of Voice: 23% (↑ from 18% last month)
   Citation Rate:     15% of queries link to your domain
   Avg Sentiment:     Positive (82% positive mentions)

   Platform Breakdown:
   ChatGPT:          Mentioned in 5/20 test queries (25%)
   Perplexity:       Mentioned in 7/20 test queries (35%)
   Google AI:        Mentioned in 4/20 test queries (20%)
   Gemini:           Mentioned in 2/20 test queries (10%)

   Top Cited Content:
   1. "Complete Guide to Home Gym Equipment" — 8 citations
   2. "Gym Equipment Comparison 2026" — 5 citations
   3. "How to Choose a Power Rack" — 3 citations

   Competitor SOV:
   Competitor A: 34% | Competitor B: 28% | You: 23% | Others: 15%

   ⚠️ Entity Issues:
   - Gemini lists incorrect pricing for Product X
   - ChatGPT references an outdated 2024 article instead of your 2026 update
```

### Step 5: Store & Trend
```
Table: seo_aeo_citations
- id, brand, query, platform (chatgpt/perplexity/google_ai/gemini)
- mentioned (boolean), citation_url, mention_context
- sentiment (positive/neutral/negative), entity_accurate (boolean)
- competitor_mentions (JSONB), checked_at

Table: seo_aeo_sov_metrics
- id, brand, site_url, period
- total_queries_tested, mentions_found, citation_count
- sov_percentage, sentiment_positive_pct
- platform_breakdown (JSONB), competitor_sov (JSONB)
- created_at
```

## Improving AI Visibility

Based on tracking data, recommend:

1. **Content not cited**: Restructure using answer-optimizer skill
2. **Low citation rate**: Build authority via off-page mentions and PR
3. **Negative sentiment**: Address the specific concerns AI surfaces
4. **Entity errors**: Publish correction content, update structured data
5. **Competitor dominance**: Analyze their cited content, create better versions
6. **Low freshness**: Update content quarterly with new data and timestamps

## Automation

- Run AI visibility checks monthly (or weekly for competitive niches)
- Auto-compare to previous period for trend detection
- Alert via Gmail when SOV drops below threshold
- Schedule re-checks via Google Calendar
- Store all data in Supabase for quarterly reporting
