---
name: featured-snippet-hunter
description: Identify and target featured snippet opportunities in Google search. Use when the user asks about featured snippets, position zero, answer boxes, quick answers, or winning SERP features. Also activates for "featured snippet", "position zero", "answer box", "snippet optimization", "win the snippet", or "People Also Ask".
---

# Featured Snippet Hunter

Discover featured snippet opportunities and optimize content to win them.

## Snippet Types & How to Win Each

### 1. Paragraph Snippets (most common, ~70% of snippets)
**Trigger**: "What is...", "Why does...", "How does..."
**Format**: 40-60 word answer paragraph
**How to win**:
- Place the question as an H2 heading
- Answer in a single paragraph of 40-60 words immediately after
- Start with "[Topic] is..." or "The [answer] is..."
- Be definitive, not hedging ("X is Y" not "X might be Y")

### 2. List Snippets (~20% of snippets)
**Trigger**: "How to...", "Steps to...", "Best...", "Top..."
**Format**: Numbered or bulleted list
**How to win**:
- Use a numbered list (ordered) for processes/steps
- Use bulleted list for "best of" / feature lists
- Include 5-8 items (Google often truncates and shows "More items...")
- Each item should be 1 concise line
- H2 should contain the list trigger word

### 3. Table Snippets (~10% of snippets)
**Trigger**: Comparison queries, "X vs Y", pricing queries
**Format**: HTML table with headers
**How to win**:
- Use an actual HTML `<table>` element (not just markdown)
- Clear column headers
- 3-6 rows of data
- Include the compared entities in the first column

## Opportunity Discovery Process

### Step 1: Find Snippet-Eligible Keywords
Use `aeo_find_snippet_opportunities` tool:
1. Take the keyword list from Wave 2
2. For each keyword, check if a featured snippet currently exists
3. Check if you currently own any snippets
4. Identify keywords where:
   - A snippet exists but you don't own it (steal opportunity)
   - No snippet exists but the query format suggests one could (new opportunity)
   - You own the snippet (defend it)

### Step 2: Analyze Current Snippet Holders
For keywords with existing snippets you don't own:
1. What format is the current snippet? (paragraph/list/table)
2. What page owns it?
3. How is their content structured?
4. What can you do better? (more specific, more current, better format)

### Step 3: Optimize for Target Snippets
For each opportunity:
1. Choose the right snippet format based on query type
2. Restructure your content following the format guidelines above
3. Ensure you already rank on page 1 (snippets almost always pull from page 1)
4. Add the exact question as an H2
5. Provide the answer in the correct format immediately after

### Step 4: Track Snippet Ownership
Store in Supabase:
```
Table: seo_aeo_snippets
- id, keyword, site_url, snippet_type (paragraph/list/table/none)
- owns_snippet (boolean), snippet_url
- competitor_snippet_url, competitor_snippet_content
- target_format, optimization_status
- last_checked_at, created_at
```

## People Also Ask (PAA) Strategy

PAA boxes are AEO gold — they represent exactly what AI engines answer.

### Mining PAA for Content Ideas:
1. Search target keywords and extract all PAA questions
2. Each PAA question is a content section opportunity
3. Group related PAA questions into FAQ sections
4. Answer each PAA question in the optimal snippet format
5. Add FAQ schema for the collection

### PAA Cascade Mining:
1. Click each PAA question — Google loads more related questions
2. Click those too — builds a deep question tree
3. This reveals the full "question universe" around a topic
4. Use this to build comprehensive pillar content that answers everything

## Snippet Defense

If you already own featured snippets:
- Monitor weekly — competitors can steal them
- Keep content fresh (update dates, stats)
- Don't change the answer format that won the snippet
- Add more depth below the answer to reinforce authority
- Track via `/seo-wave3:ranks` and this skill's monitoring
