---
name: semantic-footprint
description: Expand a brand's semantic footprint across the web to increase visibility in generative AI answers. Covers topic cluster expansion, entity coverage, prompt research, and cross-platform presence. Use when the user asks about expanding AI visibility, topic coverage, brand presence in AI, prompt optimization, or entity-based SEO. Also activates for "semantic footprint", "topic clusters for AI", "prompt research", "AI entity optimization", "expand AI presence", or "brand visibility in LLMs".
---

# Semantic Footprint Expansion

Make your brand visible across the full range of AI-generated queries in your space.

## Why Semantic Footprint Matters for GEO

AI engines don't just match keywords — they perform "query fan-out," breaking user prompts into multiple sub-queries and searching for each independently. Your content needs to appear across ALL these sub-queries, not just the primary one.

**Example**: User asks ChatGPT "What is the best protein powder for a 50-year-old woman?"
AI fan-out searches:
- "best protein powder 2026"
- "protein powder for women over 50"
- "protein powder aging health benefits"
- "protein powder low sugar options"
→ Your brand needs content ranking for ALL of these sub-queries.

## Expansion Process

### Step 1: Prompt Research (replacing keyword research)

Traditional SEO uses keyword research. GEO uses **prompt research** — understanding the full conversational queries users ask AI engines.

1. **Seed prompts**: Brainstorm the prompts users would ask AI about your business/industry
2. **Prompt expansion**: For each seed prompt, identify the sub-queries AI would fan out to
3. **Prompt clustering**: Group related prompts that would be served by the same content
4. **Gap analysis**: Which prompts does your content NOT currently address?

Use `geo_analyze_prompt_landscape` tool to:
- Generate prompt variations for a topic
- Identify sub-query fan-out patterns
- Map prompts to existing content (or flag as gaps)

### Step 2: Topic Cluster Expansion

For each core topic:
1. **Pillar content**: Comprehensive guide covering the full topic (3000+ words)
2. **Cluster content**: Supporting articles for each sub-topic
3. **Entity pages**: Clear definitions and explanations of key entities
4. **Comparison content**: "[X] vs [Y]" pages for every major comparison
5. **FAQ content**: Answer every PAA and common prompt variation

**Coverage target**: For each core topic, have content addressing:
- Definition (What is X?)
- Process (How does X work?)
- Comparison (X vs Y)
- Selection (How to choose X)
- Cost (How much does X cost?)
- Pros/cons (Is X worth it?)
- Alternatives (What are alternatives to X?)
- Use cases (Who needs X?)

### Step 3: Entity Graph Building

AI engines think in entities and relationships. Build your brand's entity graph:

1. **Define your entities clearly**: Products, services, people, locations — each needs an unambiguous definition on your site
2. **Establish relationships**: Link entities to each other with explicit relationship statements
3. **Use sameAs connections**: Schema markup linking your entity to Wikipedia, Wikidata, social profiles
4. **Create entity hubs**: Pages that serve as definitive references for each entity

### Step 4: Cross-Platform Presence

AI models learn about brands from across the entire web, not just your site:

1. **Third-party mentions**: Get mentioned on industry blogs, news sites, review platforms
2. **Wikipedia/Wikidata**: For established brands, ensure accurate entries
3. **Social proof signals**: Consistent, active presence on relevant platforms
4. **Unlinked mentions carry weight**: AI gives brand mentions value even without links
5. **Review platforms**: Google, Trustpilot, G2, Capterra — wherever your industry lives

### Step 5: Measure Semantic Coverage

Track with `geo_measure_semantic_coverage`:
- Total topic coverage percentage (your topics vs competitor topics)
- Prompt coverage (% of relevant prompts where your content appears)
- Entity completeness (% of your entities with clear definitions)
- Cross-platform presence score (mentions across platforms)

Store in Supabase:
```
Table: seo_geo_semantic_footprint
- id, site_url, topic, total_prompts_mapped, prompts_covered
- coverage_percentage, entity_completeness
- cross_platform_mentions, measured_at
```

## Ongoing Expansion

Semantic footprint building is continuous:
- Monthly: Add content for newly discovered prompt gaps
- Quarterly: Refresh all pillar content with new data
- Ongoing: Monitor competitor content for new topics to cover
- Ongoing: Build third-party mentions through outreach (Wave 3)
