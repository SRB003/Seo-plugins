---
name: brand-authority-builder
description: Build brand authority signals that generative AI engines use to decide which sources to cite. Covers original research, expert positioning, cross-platform consistency, and Share of Model measurement. Use when the user asks about brand authority for AI, building AI trust signals, Share of Model, AI brand positioning, or source credibility for LLMs. Also activates for "brand authority", "AI trust signals", "Share of Model", "source credibility", "original research strategy", or "AI brand positioning".
---

# Brand Authority Builder for GEO

Build the trust and authority signals that make AI engines choose YOUR content as the source.

## Why Authority Matters for GEO

AI engines cite 2-7 sources per answer. They choose sources based on:
1. **Content quality and structure** (covered by GEO content optimizer)
2. **Source authority and trust** (covered HERE)
3. **Recency and freshness** (covered by content freshness protocols)

The overlap between Google's top 10 and AI citations is only 8-28%. Authority signals for AI are DIFFERENT from traditional SEO authority.

## Authority Building Strategies

### Strategy 1: Original Research Publication

**Why it works**: AI engines need unique, citable data. Original research gives them something no other source has.

**Types of original research**:
- Industry surveys (survey your customers/audience)
- Data analysis from your own operations
- Benchmark reports comparing industry metrics
- Case studies with specific numbers
- A/B test results with methodology

**Publication process**:
1. Conduct the research with proper methodology
2. Publish with clear data tables, charts, and methodology section
3. Use Dataset schema markup
4. Include downloadable data where possible
5. Promote via PR and outreach (Wave 3 outreach engine)
6. Update annually with new data

### Strategy 2: Expert Positioning

**Why it works**: AI cites individuals with demonstrated expertise.

**For each team expert**:
1. Create a detailed author bio page with credentials, experience, publications
2. Use Person schema with sameAs links to all profiles
3. Publish bylined content consistently
4. Seek speaking opportunities and guest contributions
5. Get quoted in industry publications
6. Build a personal knowledge graph: author page → articles → expertise areas

### Strategy 3: Cross-Platform Consistency

**Why it works**: AI validates brands by checking consistency across the web.

**Audit checklist**:
- Brand name spelled identically everywhere
- Same core messaging/positioning across all platforms
- Consistent factual claims (pricing, features, stats)
- Active profiles on industry-relevant platforms
- Recent activity (not dormant accounts)

### Strategy 4: Earned Media & PR

**Why it works**: Mentions in high-authority publications signal trust to AI.

**Target publications that AI engines frequently cite**:
- Industry-specific trade publications
- High-authority news outlets
- Relevant podcasts (transcripts get indexed)
- University and research publications
- Government and regulatory sources

### Strategy 5: Community Authority

**Why it works**: Active participation in communities creates mention density.

**Where to build presence**:
- Reddit (specific subreddits for your industry)
- Quora (answer relevant questions with expertise)
- Stack Overflow / Stack Exchange (for technical brands)
- Industry forums and communities
- LinkedIn industry groups

## Share of Model (SoM) Measurement

Share of Model = How often AI mentions your brand vs competitors for relevant queries.

### Tracking Process:
1. Define 20-50 prompts that represent your target market
2. Test each prompt across ChatGPT, Perplexity, Google AI, Gemini
3. Record: mentioned? cited? sentiment? competitor mentions?
4. Calculate SoM = (your mentions / total brand mentions) × 100
5. Track monthly for trends

### SoM Dashboard:
```
🌐 SHARE OF MODEL — [Brand Name]
   Period: March 2026

   Overall SoM: 18% (↑ from 14%)

   By Platform:
   ChatGPT:    22% (3rd of 8 brands mentioned)
   Perplexity:  25% (2nd)
   Google AI:   15% (4th)
   Gemini:      12% (5th)

   By Topic:
   "gym equipment":     28% SoM (leader)
   "home workout":      15% SoM (3rd)
   "fitness nutrition":  8% SoM (5th)

   Competitor SoM:
   Competitor A: 31% | Competitor B: 22% | You: 18% | Others: 29%

   Trend: ↗ +4% from last month
   Top driver: New benchmark report published Feb 15
```

Store in Supabase:
```
Table: seo_geo_som
- id, brand, site_url, period
- total_prompts, mentions, citations
- som_percentage, platform_breakdown (JSONB)
- topic_breakdown (JSONB), competitor_som (JSONB)
- created_at
```

## Authority Score

Combine all signals into an authority score:

| Signal | Weight | Measure |
|--------|--------|---------|
| Original research published | 20% | Number and recency |
| Expert author pages | 15% | Completeness and schema |
| Cross-platform mentions | 20% | Mention count across web |
| Earned media placements | 15% | Authority of publications |
| Community presence | 10% | Activity and engagement |
| Share of Model | 20% | SoM percentage |

Score 0-100:
- 80+: Strong AI authority (likely to be cited)
- 60-79: Moderate (cited occasionally)
- 40-59: Weak (rarely cited)
- Below 40: Invisible to AI (urgent action needed)
