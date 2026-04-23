---
name: content-brief
description: Generate detailed, actionable content briefs for SEO-optimized articles and pages. Use when the user asks to create a content brief, plan an article, outline a blog post, prepare a writing brief, plan content for a keyword, or structure a page. Also activates for "content brief", "article outline", "writing brief", "blog structure", "content plan for keyword", or "what should this article cover".
---

# Content Brief Generator

Create comprehensive, writer-ready content briefs that maximize the chance of ranking for target keywords.

## Brief Generation Process

### Step 1: SERP Analysis

Before writing any brief, analyze what's actually ranking:

1. Use `content_analyze_serp` for the primary keyword
2. For the top 5-10 ranking pages, extract:
   - Title tags and meta descriptions
   - H1 and H2 structure (full outline)
   - Word count estimates
   - Content type (listicle, guide, comparison, etc.)
   - Unique angles or formats used
   - Internal/external link patterns
   - Media usage (images, videos, infographics)
3. Identify the **content format that Google prefers** for this query
4. Note any SERP features (featured snippets, PAA, video carousels)

### Step 2: Intent Confirmation

Classify the search intent based on SERP evidence:
- **Informational**: SERPs show blog posts, wikis, how-to guides
- **Commercial**: SERPs show reviews, comparisons, "best of" lists
- **Transactional**: SERPs show product pages, pricing, buy buttons
- **Navigational**: SERPs show brand/homepage results

The brief MUST match the dominant intent. Don't create a blog post brief for a transactional keyword.

### Step 3: Build the Brief

Generate a complete brief with these sections:

---

#### 📋 CONTENT BRIEF TEMPLATE

**Target Keyword**: [primary keyword]
**Secondary Keywords**: [3-8 related terms to include naturally]
**Search Intent**: [informational / commercial / transactional]
**Content Type**: [blog post / guide / landing page / comparison / FAQ]

**Title Tag Suggestion**: [under 60 chars, keyword near front]
**Meta Description Suggestion**: [150-160 chars, includes CTA]
**URL Slug Suggestion**: [short, keyword-rich]

---

**Target Word Count**: [based on top-ranking competitor average, typically 1.2x the average]

**Target Audience**: [who is searching this, what do they need]

**Content Goal**: [what should the reader do/know after reading]

---

**Outline (H2/H3 Structure)**:

```
H1: [Main title - keyword included]
  H2: [Section 1 - address main query directly]
    H3: [Subsection detail]
    H3: [Subsection detail]
  H2: [Section 2 - expand on related aspect]
    H3: [Subsection]
  H2: [Section 3 - unique angle not covered by competitors]
  H2: [Section 4 - practical/actionable section]
  H2: [FAQ section - pulled from PAA]
    H3: [Question 1]
    H3: [Question 2]
    H3: [Question 3]
```

---

**Keywords to Include**:
| Keyword | Where to Use | Frequency |
|---------|-------------|-----------|
| [primary] | H1, first paragraph, conclusion | 3-5x naturally |
| [secondary 1] | H2 or body | 1-2x |
| [secondary 2] | H2 or body | 1-2x |
| [LSI term] | Body text | 1x |

---

**Internal Links to Include**:
- Link TO: [list pages on the site that relate to this topic]
- Link FROM: [list existing pages that should link to this new content]

**External Reference Sources**:
- [Authoritative sources to cite or reference for credibility]

---

**Content Differentiators** (what makes this piece rank above competitors):
- [ ] Unique data, stat, or insight not in competing articles
- [ ] More actionable advice / step-by-step detail
- [ ] Better visual aids (suggest specific images, diagrams, tables)
- [ ] Fresher information (if competitors are outdated)
- [ ] Covers an angle competitors missed

---

**Featured Snippet Optimization** (if applicable):
- Target format: [paragraph / list / table]
- The answer to the query in under 50 words (for paragraph snippet):
  "[Draft snippet-optimized answer]"

---

**Media Suggestions**:
- Hero image: [describe what it should show]
- Supporting images: [list 2-3 specific images needed]
- Tables/charts: [any data that would work well as a visual]

---

**Schema Markup**: [Article / FAQ / HowTo — based on content type]

---

### Step 4: Validate the Brief

Before presenting, check:
- [ ] Target keyword appears in title, H1, first paragraph, a H2, and conclusion
- [ ] Secondary keywords are distributed across different sections
- [ ] Outline covers all major subtopics from top-ranking competitors
- [ ] At least one unique angle or differentiator identified
- [ ] Word count target is realistic for the topic depth
- [ ] Internal linking targets exist on the site
- [ ] Content type matches search intent
- [ ] Featured snippet opportunity addressed if applicable

### Step 5: Store & Schedule

If Supabase is connected:
```
Table: seo_content_briefs
- id, keyword_cluster_id, primary_keyword, title_suggestion
- meta_description, target_word_count, outline_json
- internal_links_json, status (draft/approved/in_progress/published)
- assigned_to, due_date, created_at
```

If Google Calendar MCP is connected:
- Create a calendar event for the content due date
- Include brief summary in event description

If Gmail MCP is connected:
- Option to email the brief to a writer/team member

## Batch Brief Generation

When the user has multiple keywords from the keyword research phase:

1. Pull approved keyword clusters from Supabase (or accept a list)
2. Generate briefs in priority order
3. Present a summary table: Keyword | Title | Word Count | Due Date | Status
4. Store all briefs in Supabase pipeline
5. Create calendar events for the full content calendar

## Quality Principles

- **Match intent first**: A perfectly written article on the wrong intent won't rank
- **Outline from data**: Every H2 should be justified by what competitors cover or what users ask
- **Differentiation is mandatory**: If the brief is just "copy what's ranking," the content won't win
- **Be specific**: "Write about benefits" is a bad brief. "Cover these 5 specific benefits with data" is good
- **Include the ugly details**: Word count, keyword placement, link targets — writers need precision
