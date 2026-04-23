---
name: content-writer
description: Draft SEO-optimized articles and web content based on content briefs. Use when the user asks to write an article, draft a blog post, create web page content, generate SEO content, write based on a brief, or produce content for a keyword. Also activates for "write article", "draft blog post", "create content", "write for keyword", "generate article", or "content for this brief".
---

# AI Content Writer

Draft high-quality, SEO-optimized content based on content briefs. The goal is to produce a first draft that needs minimal human editing.

## Writing Process

### Step 1: Load the Brief

Before writing anything:

1. If a brief exists in Supabase → pull it via `content_get_brief` tool
2. If no formal brief → use the `content-brief` skill to generate one first
3. NEVER write content without a clear target keyword and outline

Extract from the brief:
- Primary and secondary keywords
- Target word count
- H2/H3 outline structure
- Search intent
- Content differentiators
- Internal linking targets
- Featured snippet target (if any)

### Step 2: Research Phase

Before drafting:

1. Use `content_analyze_serp` to read what's currently ranking
2. Note specific facts, stats, or angles from top results
3. Identify what competitors are missing or doing poorly
4. Gather any data points or examples to reference

**Important**: Never plagiarize competing content. Use SERP analysis for topic coverage gaps and factual reference only. All writing must be original.

### Step 3: Draft the Content

Follow these writing rules:

#### Structure
- **H1**: Include primary keyword, compelling, matches title tag
- **Introduction** (100-150 words):
  - Hook the reader in the first sentence
  - State the problem or question clearly
  - Include primary keyword in first paragraph
  - Preview what they'll learn
- **Body sections** (follow H2/H3 outline from brief):
  - Each H2 section should be self-contained and valuable
  - Use H3s to break up long sections
  - Include keyword variations naturally
  - Add transition sentences between sections
- **Conclusion** (100-150 words):
  - Summarize key takeaways
  - Include primary keyword
  - Clear call-to-action
  - Link to related content

#### SEO Writing Rules
- **Keyword density**: 1-2% for primary keyword (natural, not stuffed)
- **First 100 words**: Must contain primary keyword
- **H2 tags**: At least one should contain primary or secondary keyword
- **Paragraph length**: Max 3-4 sentences per paragraph (scannable)
- **Sentence length**: Mix short and long. Average under 20 words.
- **Active voice**: Prefer active over passive
- **Transition words**: Use in 30%+ of sentences for readability
- **Lists and bullets**: Include at least 1-2 per article for scannability
- **Internal links**: Insert all links specified in the brief with descriptive anchor text
- **External links**: Reference 2-3 authoritative sources where factual claims need support

#### Tone & Quality Rules
- Write like a knowledgeable human, not a machine
- Avoid filler phrases: "In today's world", "It's important to note", "In conclusion"
- Avoid AI-obvious patterns: Don't start 3 paragraphs in a row the same way
- Use specific examples, numbers, and data points over vague claims
- Match the tone to the audience (B2B = professional, consumer = conversational)
- If the brief specifies a brand voice, follow it

#### Featured Snippet Optimization
If the brief identifies a snippet opportunity:
- **Paragraph snippet**: Answer the query directly in 40-50 words right after the relevant H2
- **List snippet**: Use a numbered or bulleted list immediately after the H2
- **Table snippet**: Create an HTML table with the comparison data

### Step 4: Add SEO Metadata

After drafting the body content, generate:
- **Title tag**: From the brief (or optimize if brief suggestion is weak)
- **Meta description**: Compelling, under 160 chars, includes keyword and CTA
- **OG title**: Can match title tag or be slightly different for social
- **OG description**: Optimized for social sharing (can be more casual)
- **Schema suggestion**: Article / BlogPosting / FAQ / HowTo based on content type

### Step 5: Self-Review Checklist

Before presenting the draft, verify:

- [ ] Primary keyword in: H1, first paragraph, at least one H2, last paragraph
- [ ] Secondary keywords distributed naturally throughout
- [ ] Word count within 10% of target
- [ ] All internal links from brief are inserted
- [ ] At least 2 external authoritative references
- [ ] No paragraph longer than 4 sentences
- [ ] At least one list or table included
- [ ] Featured snippet answer placed correctly (if applicable)
- [ ] No duplicate phrasing with competitor content
- [ ] Meta title under 60 chars with keyword
- [ ] Meta description under 160 chars with CTA
- [ ] Content matches the search intent (informational ≠ sales pitch)
- [ ] Conclusion has a clear CTA

### Step 6: Score the Content

Use the `content-scorer` skill to run the draft through the SEO scoring engine before presenting to the user. Include the score with the draft.

### Step 7: Present for Review

Show the user:
1. **SEO score** (from content-scorer)
2. **The full draft** in markdown format
3. **Metadata** (title, description, schema)
4. **Keyword usage report**: Where each keyword appears and frequency
5. **Options**: "Approve & publish", "Edit & revise", "Generate alternative version"

### Step 8: Publish (on approval)

If user approves and Webflow MCP is connected:
1. Create a new CMS item in the target collection (blog, articles, etc.)
2. Set title, slug, body (rich text), meta title, meta description
3. Set to "Draft" status in Webflow (not live until user publishes)
4. Update the Supabase `seo_content_briefs` status to "published"
5. Log in Supabase `seo_content_log` table

If Gmail MCP is connected:
- Option to email the draft for external review

## Batch Content Generation

For generating multiple articles:
1. Pull approved briefs from Supabase pipeline
2. Draft each one sequentially
3. Score each
4. Present a summary dashboard: Title | Word Count | SEO Score | Status
5. Batch-push approved drafts to Webflow CMS

## Content Refresh Mode

When updating existing content (not creating new):
1. Pull the current content from Webflow CMS
2. Compare against the brief / current SERP landscape
3. Identify sections to add, update, or remove
4. Generate a diff/revision showing changes
5. On approval, push update via Webflow MCP
6. Log the refresh in Supabase with before/after
