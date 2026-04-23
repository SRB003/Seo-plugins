---
name: geo-content-optimizer
description: Optimize content for generative AI engines using proven GEO techniques — citation addition, statistics insertion, expert quotes, fluency optimization, and reference-style formatting. Use when the user asks to optimize for AI search, generative engines, ChatGPT SEO, LLM optimization, AI-friendly content, or getting cited by AI. Also activates for "generative engine optimization", "GEO", "optimize for ChatGPT", "LLM SEO", "AI search optimization", "get cited by AI", or "RAG optimization".
---

# GEO Content Optimizer

Apply research-backed GEO techniques to make content retrievable, re-rankable, and reference-worthy by generative AI engines.

## The GEO Framework (from Princeton Research)

The Princeton GEO study identified these techniques as most effective for improving AI visibility. The top combination (Statistics + Fluency Optimization) outperforms any single technique by 5.5%+.

### Technique 1: Cite Sources (30-40% visibility improvement)
**What**: Add explicit citations to authoritative sources for every factual claim.
**Why**: AI systems use citations as trust signals when deciding what to reference.
**How**:
- Every statistic, fact, or claim should reference its source
- Use the format: "According to [Source], [Fact]" or "[Fact] (Source, Year)"
- Prefer primary sources (research papers, official reports, company data)
- Include 3-5 citations per 500 words minimum
- Name the specific publication/study, not just "studies show"

### Technique 2: Add Statistics (30-40% visibility improvement)
**What**: Insert specific numerical data points throughout content.
**Why**: AI engines favor content with verifiable, concrete data over vague claims.
**How**:
- Replace vague claims with specific numbers: "many businesses" → "73% of businesses"
- Include percentages, dollar amounts, timeframes, quantities
- Cite the source for each statistic
- Target 1 statistic per 200-300 words
- Use recent data (last 2 years preferred)

### Technique 3: Quotation Addition (20-30% visibility improvement)
**What**: Include direct quotes from recognized experts.
**Why**: Expert quotes serve as E-E-A-T signals that boost credibility for AI citation.
**How**:
- Add 1-2 expert quotes per major section
- Attribute quotes to named individuals with credentials
- Use quotes that add unique insight, not generic platitudes
- Format: "[Expert Name], [Title/Credential], states: '[Quote]'"

### Technique 4: Fluency Optimization (25-35% visibility improvement)
**What**: Improve writing clarity, readability, and conciseness.
**Why**: AI engines process and re-synthesize content — clearer input = better output.
**How**:
- Shorten sentences (target avg 15-18 words)
- Remove hedging language ("might", "could possibly", "it seems")
- Use active voice predominantly
- Front-load key information in each paragraph
- Eliminate redundancy and filler

### Technique 5: Technical Terminology (15-25% visibility improvement)
**What**: Use precise domain-specific terminology where appropriate.
**Why**: AI models associate technical accuracy with expertise and authority.
**How**:
- Use correct industry terminology (don't over-simplify for SEO)
- Define technical terms on first use
- Include abbreviations with expansions
- Use consistent terminology throughout

### Best Combination: Statistics + Fluency (highest overall improvement)

## Content Optimization Process

### Step 1: Audit Current Content
Use `geo_audit_content` tool to analyze:
- Current citation count and quality
- Statistic density
- Expert quote presence
- Readability and fluency metrics
- Technical terminology usage
- AI extractability structure

### Step 2: Apply GEO Techniques
For each piece of content:
1. **Add missing citations**: Identify factual claims without sources, research and add authoritative references
2. **Insert statistics**: Replace vague claims with specific data points with sources
3. **Add expert quotes**: Find and insert relevant expert commentary
4. **Optimize fluency**: Shorten sentences, remove hedging, activate voice
5. **Enhance terminology**: Use precise domain terms where appropriate
6. **Structure for extraction**: Ensure key answers are in extractable positions

### Step 3: Format for AI Retrieval

**Content that AI engines love:**
- Definition blocks: "[Term] is [clear definition]"
- Comparison tables with specific data points
- Process lists with numbered steps
- Pro/con assessments with specifics
- "Last updated: [date]" timestamps

**Content that AI engines skip:**
- Vague, opinion-heavy prose without data
- Walls of text without structure
- Outdated information without update signals
- Content behind login walls or heavy JavaScript
- Content blocked by robots.txt for AI crawlers

### Step 4: Score & Compare
Score the optimized version against the original using `geo_score_content`:
- Before/after comparison for each GEO metric
- Estimated visibility improvement based on Princeton research data
- Specific remaining gaps to address

## AI Crawler Access Checklist

Before any content optimization, verify AI engines can actually read your content:

- [ ] robots.txt does NOT block AI user agents (ChatGPT-User, GPTBot, PerplexityBot, Google-Extended, ClaudeBot)
- [ ] Cloudflare/CDN is not blocking AI bots (check settings)
- [ ] Content is server-rendered (not client-side JavaScript only)
- [ ] No login wall or paywall blocking content
- [ ] Pages load fast (< 3 seconds)
- [ ] Valid HTML structure with semantic tags
- [ ] Complete JSON-LD schema markup present

## Content Freshness Protocol

AI has a strong recency bias (citations drop off sharply after 3 months):

1. Review cornerstone content quarterly
2. Update statistics with current year data
3. Add new examples and case studies
4. Refresh expert quotes with recent commentary
5. Update the "Last updated" timestamp
6. Re-submit sitemap after updates
7. Cross-reference with AI citation tracker to verify renewed visibility
