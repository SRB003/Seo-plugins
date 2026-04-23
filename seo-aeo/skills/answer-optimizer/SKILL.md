---
name: answer-optimizer
description: Optimize content to be selected as the direct answer by AI engines and Google's featured snippets. Use when the user asks to optimize for answer engines, AI search, zero-click search, featured snippets, AI Overviews, ChatGPT visibility, Perplexity citations, or voice search. Also activates for "answer engine optimization", "AEO", "optimize for AI", "be the answer", "zero-click", "AI citation", "voice search optimization", or "get cited by ChatGPT".
---

# Answer Engine Optimizer

Structure content so AI-powered platforms select it as the authoritative answer.

## Core AEO Principles

### 1. Answer-First Content Design

Traditional SEO buries answers deep in articles. AEO puts the answer up front.

**The AEO content pattern:**
```
[H2: Question phrased exactly as users ask it]
[Direct answer in 40-60 words — the "snippet-ready" paragraph]
[Expanded explanation with context, examples, data]
[Supporting evidence with citations]
```

**Why this works:**
- AI engines extract the concise answer for their response
- The expanded section provides depth for credibility assessment
- Citations signal trustworthiness to RAG-based systems

### 2. Entity-Based Optimization

AI engines think in entities (people, places, concepts), not keywords.

**For every topic, establish:**
- Clear entity definitions ("X is a [category] that [function]")
- Relationships between entities ("X is made by Y for Z purpose")
- Attributes with specific values ("X costs $Y, weighs Z, available in [locations]")
- Comparisons with related entities ("X vs Y: X is better for A, Y is better for B")

### 3. Structured Extractability

Make content easy for AI to parse and reassemble:
- **Headings as questions**: Match actual user prompts
- **Tables for comparisons**: AI loves extractable tabular data
- **Numbered lists for processes**: Step-by-step instructions are citation magnets
- **Definition patterns**: "X is..." statements are highly extractable
- **Fact density**: Include specific numbers, dates, prices, measurements

### 4. E-E-A-T Signals for AI Trust

AI engines evaluate source credibility:
- **Experience**: First-hand accounts, case studies, "we tested" language
- **Expertise**: Author bylines with credentials, expert quotes
- **Authoritativeness**: Citations to primary sources, original research
- **Trustworthiness**: Accurate data, balanced perspectives, clear sourcing

## Page-Level AEO Optimization Process

### Step 1: Identify Target Questions
1. Use Wave 2 keyword research to find question-based queries
2. Mine Google's "People Also Ask" for the target topic
3. Check what questions ChatGPT and Perplexity answer in this space
4. Prioritize questions by: search volume, business relevance, competition

### Step 2: Audit Current Content
Use `aeo_audit_page` tool to check:
- Does the page answer target questions directly?
- Are answers within the first 50 words of each section?
- Is content structured with question headings?
- Are facts cited with sources?
- Is there proper schema markup (FAQ, HowTo, Article)?
- Are author credentials present?
- Is the content fresh (updated within 3 months)?

### Step 3: Optimize Content Structure
For each target question:
1. Add an H2 heading that matches the question exactly
2. Write a 40-60 word direct answer immediately after the heading
3. Follow with detailed explanation (200-400 words)
4. Include at least one statistic or data point with source
5. Add relevant internal links to supporting content
6. Include expert quote or first-hand experience

### Step 4: Add AEO-Specific Schema
Beyond standard Article/FAQ schema, add:
- **Speakable** schema (marks content suitable for voice/audio)
- **HowTo** schema (for process-based content)
- **QAPage** schema (for Q&A format content)
- **ClaimReview** schema (for fact-check type content)
- **Dataset** schema (if presenting original research)

### Step 5: Verify AI Extractability
Use `aeo_test_extractability` tool to:
- Simulate how an AI would extract answers from the page
- Check if key facts are in extractable positions
- Verify schema is valid and complete
- Test against actual AI prompts

## Content Scoring for AEO (extends Wave 2 scorer)

### AEO-Specific Scoring Criteria (additional 30 points on top of SEO score):

| Check | Points | Criteria |
|-------|--------|----------|
| Answer-first structure | 5 | Direct answer within first 50 words of each section |
| Question-format headings | 5 | H2s match actual user questions |
| Fact density | 5 | ≥1 specific statistic per 300 words |
| Source citations | 5 | External sources cited for factual claims |
| Author/expertise signals | 3 | Author byline + credentials present |
| Schema for AI extraction | 4 | FAQ/HowTo/Speakable schema implemented |
| Content freshness signal | 3 | "Last updated" date within 90 days |

**Combined score: SEO (100) + AEO (30) = 130 total possible**
- 110+: Excellent AEO readiness
- 90-109: Good — minor AEO tweaks needed
- 70-89: Fair — significant AEO optimization needed
- Below 70: Needs full AEO restructuring

## Platform-Specific Optimization

### Google AI Overviews
- 76% overlap with organic top 10 — strong SEO is the foundation
- Structure content with clear, concise answer paragraphs
- FAQ schema is heavily favored
- Content freshness is critical

### ChatGPT
- Only 8% overlap with Google top 10 — different citation logic
- Favors comprehensive, well-sourced content
- Brand mentions across multiple credible sources improve visibility
- ~70% of AI search market share

### Perplexity
- 28% overlap with Google — closest to traditional SEO
- Strong preference for clarity, recency, and citations
- Provides clickable source links — actual referral traffic
- Growing rapidly as search alternative

### Voice Assistants (Google Assistant, Siri, Alexa)
- Answer must be speakable in under 30 seconds
- Use natural conversational language
- Add Speakable schema markup
- Target position zero / featured snippet
