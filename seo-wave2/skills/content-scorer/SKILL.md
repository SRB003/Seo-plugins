---
name: content-scorer
description: Score content for SEO readiness before publishing. Use when the user asks to score an article, check content SEO, evaluate a draft, rate content quality, check keyword usage, assess readability, or validate content before publishing. Also activates for "score this content", "SEO check article", "is this ready to publish", "content quality check", or "readability score".
---

# Content SEO Scorer

Evaluate content against a comprehensive SEO scorecard before publishing. This skill produces a score out of 100 and flags specific issues to fix.

## Scoring Categories

### 1. Keyword Optimization (25 points)

| Check | Points | Criteria |
|-------|--------|----------|
| Primary keyword in H1 | 5 | Exact or close variant in the H1 tag |
| Primary keyword in first 100 words | 5 | Appears naturally in the opening paragraph |
| Primary keyword in a H2 | 3 | At least one H2 contains the keyword or variant |
| Primary keyword in conclusion | 3 | Appears in the final paragraph |
| Keyword density 1-2% | 4 | Not under-optimized, not stuffed |
| Secondary keywords present | 3 | At least 3 secondary terms used naturally |
| No keyword stuffing | 2 | No unnatural repetition or forced placement |

**How to calculate keyword density:**
`(keyword occurrences / total words) × 100`

### 2. Content Structure (20 points)

| Check | Points | Criteria |
|-------|--------|----------|
| Proper H1 (single, descriptive) | 4 | Exactly one H1 that includes the topic |
| Logical H2/H3 hierarchy | 4 | H2s for main sections, H3s for subsections, no skips |
| Adequate heading count | 3 | At least 1 H2 per 300 words |
| Introduction present | 3 | 100-200 word intro that sets up the article |
| Conclusion present | 3 | Clear conclusion with summary and CTA |
| Table of contents viable | 3 | For articles > 1500 words, enough H2s for a TOC |

### 3. Readability (20 points)

| Check | Points | Criteria |
|-------|--------|----------|
| Average sentence length < 20 words | 4 | Mix of short and medium sentences |
| Paragraph length ≤ 4 sentences | 4 | No wall-of-text paragraphs |
| Transition words in 25%+ of sentences | 3 | "However", "Additionally", "For example", etc. |
| Flesch reading ease ≥ 60 | 4 | Accessible to a general audience |
| Active voice dominant (>80%) | 3 | Minimal passive constructions |
| No filler phrases | 2 | No "In today's world", "It goes without saying", etc. |

**Flesch Reading Ease formula:**
`206.835 - 1.015 × (total words / total sentences) - 84.6 × (total syllables / total words)`

- 60-70: Standard (8th-9th grade) — ideal for most web content
- 70-80: Fairly easy (7th grade)
- 50-60: Fairly difficult (10th-12th grade)
- Below 50: Too complex for general web content

### 4. Technical SEO (15 points)

| Check | Points | Criteria |
|-------|--------|----------|
| Meta title present & optimized | 3 | Under 60 chars, keyword included |
| Meta description present & optimized | 3 | 150-160 chars, keyword + CTA |
| URL slug optimized | 2 | Short, keyword-rich, no stop words |
| Internal links included | 3 | At least 2-3 contextual internal links |
| External links to authority sources | 2 | At least 1-2 credible external references |
| Image alt text planned | 2 | Alt text for all images includes context |

### 5. Content Quality (10 points)

| Check | Points | Criteria |
|-------|--------|----------|
| Meets target word count (±10%) | 3 | Within range specified in the brief |
| Contains specific data/examples | 3 | Numbers, stats, case studies — not vague claims |
| Unique angle or differentiator | 2 | Something competitors don't cover |
| Matches search intent | 2 | Informational content for informational queries, etc. |

### 6. Engagement Elements (10 points)

| Check | Points | Criteria |
|-------|--------|----------|
| At least 1 list/bullet section | 2 | Scannable content elements |
| At least 1 table or visual data | 2 | Structured data presentation |
| Call-to-action present | 2 | Clear next step for the reader |
| Featured snippet optimized | 2 | Direct answer format if snippet opportunity exists |
| Social sharing metadata | 2 | OG title and description set |

## Scoring Execution

### Using the MCP Server Tools

Use `content_score_draft` tool which accepts:
- The content body (markdown or HTML)
- The primary keyword
- Secondary keywords list
- Target word count
- Brief metadata (if available)

The tool returns a structured score breakdown.

### Manual Scoring Fallback

If the MCP tool isn't available, calculate the score by:

1. Parse the content into components (headings, paragraphs, sentences, words)
2. Check each criterion from the tables above
3. Sum the points
4. Generate the issues list

## Output Format

Present the score as:

```
═══════════════════════════════════════
         SEO CONTENT SCORE: 78/100
═══════════════════════════════════════

📊 Category Breakdown:
  Keyword Optimization:  21/25  ████████████████████░░░░░
  Content Structure:     18/20  ██████████████████████░░░
  Readability:           15/20  ██████████████████░░░░░░░
  Technical SEO:         12/15  ████████████████████░░░░░
  Content Quality:        7/10  █████████████████░░░░░░░░
  Engagement:             5/10  ████████████░░░░░░░░░░░░░

🔴 Critical Issues:
  - Primary keyword missing from conclusion
  - Meta description exceeds 160 characters

🟡 Improvements:
  - Add 2 more internal links
  - Break paragraph in Section 3 (currently 6 sentences)
  - Include at least one data table

🟢 Nice to Have:
  - Add OG image metadata
  - Consider adding a FAQ section for PAA coverage

✅ Strengths:
  - Strong keyword placement in H1 and introduction
  - Good heading hierarchy
  - Active voice usage at 87%
```

## Score Thresholds

| Score | Rating | Action |
|-------|--------|--------|
| 90-100 | Excellent | Ready to publish |
| 75-89 | Good | Minor tweaks recommended |
| 60-74 | Fair | Needs revision before publishing |
| 40-59 | Poor | Major revision required |
| 0-39 | Failing | Rewrite recommended |

## Integration with Content Pipeline

After scoring:
- Score ≥ 75 → Offer to publish to Webflow CMS
- Score 60-74 → Highlight specific fixes, re-score after changes
- Score < 60 → Recommend using `content-writer` skill to redraft

Store scores in Supabase:
```
Table: seo_content_scores
- id, content_id, brief_id, score_total, score_breakdown_json
- issues_json, version, created_at
```

This enables tracking score improvements across drafts and measuring content quality trends over time.
