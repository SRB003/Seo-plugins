---
name: digital-pr-strategist
description: Create digital PR strategies including data-driven story pitches, newsjacking opportunities, expert commentary positioning, journalist query matching, and press release optimization for earning high-authority backlinks. Use when the user asks about digital PR, press coverage, journalist outreach, HARO, newsjacking, PR angles, media coverage, press releases, or earning editorial links. Also activates for "digital PR", "press coverage", "journalist outreach", "HARO", "newsjack", "media mentions", "PR strategy", "press release", or "earn editorial links".
---

# Digital PR Strategist

Develop and execute digital PR strategies to earn high-authority backlinks from news outlets, publications, and industry media.

## PR Strategy Framework

### Strategy 1: Data-Driven Stories

**Goal**: Create original research and data that journalists want to cite.

**Process**:
1. **Identify data gaps**: Use `offpage_discover_pr_opportunities` to find trending topics in your niche that lack fresh data
2. **Create the data**: Design surveys, analyze proprietary data, scrape public datasets, or compile industry benchmarks
3. **Package the story**: Write a press-ready summary with key findings, methodology, and quotable stats
4. **Target outlets**: Identify journalists who cover your niche and have written about similar data in the past
5. **Pitch**: Lead with the most surprising finding — not your brand

**Data Story Formats**:
| Format | Link Potential | Effort | Example |
|--------|---------------|--------|---------|
| Industry survey | Very high | High | "State of [Industry] 2026 Report" |
| Data analysis | High | Medium | "We analyzed 10,000 [things] — here's what we found" |
| Benchmark study | High | Medium | "[Industry] benchmark: how does your company compare?" |
| Cost calculator | Medium | Low | "The true cost of [thing] in every state" |
| Trend tracker | Medium | Low | "How [metric] has changed over 5 years" |

### Strategy 2: Newsjacking

**Goal**: React to breaking news with expert commentary before competitors do.

**Process**:
1. **Monitor news**: Use `offpage_discover_pr_opportunities` to find breaking stories in your niche
2. **Speed is everything**: Respond within hours, not days
3. **Add unique value**: Don't just react — add expert analysis, predictions, or actionable advice
4. **Pre-build journalist relationships**: Have a media list ready before news breaks
5. **Use reactive PR template** (see below)

**Newsjacking Assessment**:
```
Is this story worth newsjacking?
  ✅ Directly relevant to your expertise
  ✅ You can add genuine insight (not just "we agree")
  ✅ Story is < 24 hours old
  ✅ Major outlets are covering it
  ❌ Skip if: you're forcing a connection, story is controversial/sensitive, or you're too late
```

### Strategy 3: Expert Commentary & Journalist Queries

**Goal**: Position your team as go-to sources for journalist queries.

**Process**:
1. **Monitor sources**: Track HARO (Help a Reporter Out), Qwoted, SourceBottle, #JournoRequest on X
2. **Respond fast**: Journalist queries have 24-48 hour windows — respond within hours
3. **Provide ready-to-publish quotes**: Journalists want quotes they can copy-paste
4. **Include credentials**: Always include title, company, and relevant experience
5. **Follow up once**: If selected, share the article and build the relationship

**Expert Response Template**:
```
Subject: Source for your [topic] piece — [Your Name], [Title]

Hi [Journalist Name],

Re: your query about [specific topic].

[2-3 sentence expert quote with specific insight, data point, or prediction]

Background: I'm [Your Name], [Title] at [Company]. I've [relevant credential — e.g., "worked in this space for 10 years" or "led a team that processed 50K+ orders"].

Happy to elaborate, provide additional data, or hop on a quick call.

[Your Name]
[Title], [Company]
[Phone] | [Email]
```

### Strategy 4: Trend Pieces & Predictions

**Goal**: Create forward-looking content that publications cite as authoritative.

**Process**:
1. Identify emerging trends in your niche using `offpage_discover_pr_opportunities`
2. Write a comprehensive trend analysis with data backing
3. Include expert predictions from your team (quotable)
4. Pitch to industry publications as a contributed article or source material
5. Time releases for maximum impact (January for annual predictions, Q4 for next-year forecasts)

### Strategy 5: Press Release Optimization

**Goal**: Distribute newsworthy announcements for pickup and links.

**When to use press releases**:
- Product launches with genuine news value
- Major partnerships or acquisitions
- Industry awards or recognition
- Original research publications
- Significant milestones (not vanity metrics)

**When NOT to use press releases**:
- Minor product updates
- Blog post promotions
- Generic company news nobody cares about

**Press Release SEO Rules**:
1. Include target keywords naturally in headline and first paragraph
2. Add Schema markup (NewsArticle) on your press page
3. Include multimedia (images, video) — increases pickup 77%
4. Use one branded anchor link to your site (never exact-match keyword anchors)
5. Distribute via reputable wire services only

## PR Pitch Templates

### Data Story Pitch
```
Subject: Exclusive data: [Most surprising finding]

Hi [Name],

[One-sentence hook with the most surprising stat from your research]

We just completed [research type] analyzing [data set]. Key findings:

• [Finding 1 — the most newsworthy]
• [Finding 2 — the most actionable]
• [Finding 3 — the most unexpected]

The full report with methodology is ready for review. Happy to provide exclusive access before publication.

[Your name]
[Company]
```

### Newsjack Pitch
```
Subject: Expert reaction: [News story headline in 5 words]

Hi [Name],

Re: [news story]. Quick expert take:

"[2-3 sentence expert quote with specific, actionable insight]"

— [Your Name], [Title], [Company] ([1 line credential])

Full quote available for your piece. Happy to elaborate on [specific angle].
```

## PR Campaign Tracking

Store in Supabase:
```
Table: seo_pr_campaigns
- id, brand_name, campaign_type
- pitch_topic, pitch_angle
- target_outlets (JSONB)
- pitches_sent, responses, coverage_earned
- links_earned (JSONB) — URL, anchor, DA estimate
- coverage_urls (JSONB) — URLs of published coverage
- status (planning/pitching/active/completed)
- created_at, updated_at
```

## PR Performance Metrics

Track and report on:
- **Coverage rate**: Pitches sent vs coverage earned
- **Link earn rate**: Coverage pieces that include a backlink
- **Domain authority of covering sites**: Quality of links earned
- **Referral traffic**: Visits from PR coverage
- **Brand mention lift**: Search volume for brand name after PR pushes

## Safety & Ethics

- NEVER fabricate data or statistics
- NEVER misrepresent expertise or credentials
- NEVER spam journalists — personalized, relevant pitches only
- NEVER pitch the same story to competing journalists without disclosure
- Always disclose if you have a commercial interest in the story
- Respect journalists' time — be concise, be available, be helpful
