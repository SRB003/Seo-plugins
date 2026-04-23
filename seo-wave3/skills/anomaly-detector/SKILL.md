---
name: anomaly-detector
description: Detect and diagnose unusual SEO performance changes including traffic drops, ranking losses, crawl errors, and algorithm update impacts. Use when the user asks about traffic drops, ranking losses, unexpected changes, algorithm updates, SEO issues, site problems, or performance anomalies. Also activates for "why did rankings drop", "traffic decrease", "lost rankings", "algorithm update", "SEO problem", "diagnose drop", or "what happened to my rankings".
---

# SEO Anomaly Detector

Automatically detect unusual changes in SEO performance, diagnose probable causes, and recommend corrective actions.

## Detection Framework

### Anomaly Types

#### 1. Ranking Drops
**Trigger**: Any keyword drops 5+ positions in a single check, or 3+ keywords drop simultaneously.

**Diagnosis checklist**:
1. **Check timing**: When exactly did the drop happen?
2. **Google Algorithm Update**: Use `monitor_check_algorithm_updates` to check if a known algorithm update coincides with the drop timing
3. **Technical issue**: Use Wave 1 tools to check:
   - Is the page still returning 200?
   - Was robots.txt changed (accidentally blocking)?
   - Was a noindex tag added?
   - Did the canonical URL change?
   - Did the page redirect somewhere unexpected?
4. **Content change**: Check `seo_changes` table — was the page content modified recently?
5. **Backlink loss**: Check `seo_backlink_snapshots` — did the page lose significant backlinks?
6. **Competitor movement**: Use `monitor_check_rankings` — did a specific competitor leap above you?
7. **Cannibalization**: Is another page on your site now ranking for this keyword instead?

**Response matrix**:
| Cause | Action |
|-------|--------|
| Algorithm update | Analyze what the update targets, audit content against new criteria |
| Technical issue | Fix immediately using Wave 1 tools |
| Content was degraded | Revert changes or use Wave 2 to refresh content |
| Lost backlinks | Flag for outreach to recover or replace links |
| Competitor surged | Analyze competitor changes, update your content to be more competitive |
| Cannibalization | Consolidate pages or differentiate their targets |

#### 2. Crawl Errors
**Trigger**: New 4xx/5xx errors detected that didn't exist in previous audit.

**Diagnosis**:
1. What pages are returning errors?
2. Were they recently moved or deleted?
3. Are important internal links now pointing to error pages?
4. Is the sitemap referencing non-existent pages?

**Response**: Auto-generate fix recommendations, flag for Wave 1 `/seo-wave1:fix` commands.

#### 3. Core Web Vitals Degradation
**Trigger**: Any CWV metric moves from "good" to "needs improvement" or "poor".

**Diagnosis**:
1. Which metric degraded? (LCP, CLS, INP)
2. Was new JavaScript/CSS/images added recently?
3. Did hosting/CDN configuration change?
4. Is the issue site-wide or page-specific?

**Response**: Flag specific metrics and pages, suggest performance optimizations.

#### 4. Backlink Anomalies
**Trigger**: Sudden loss of 5+ referring domains, or new toxic backlinks detected.

**Diagnosis**:
1. Which domains stopped linking?
2. Were the links from the same source (e.g., directory that removed listings)?
3. Are the new backlinks from spam/toxic domains?
4. Is there a negative SEO attack pattern?

**Response**: Flag lost links for recovery outreach, toxic links for disavow consideration.

#### 5. Index Coverage Changes
**Trigger**: Pages dropping out of Google's index, or new pages not getting indexed.

**Diagnosis**:
1. Check robots.txt for changes
2. Check for noindex tags
3. Verify sitemap includes the pages
4. Check canonical tag issues
5. Review server response codes

**Response**: Fix technical issues, resubmit to search engines.

## Anomaly Detection Process

### Step 1: Gather Current State
1. Run `monitor_check_rankings` for all tracked keywords
2. Run `monitor_check_backlinks` for the site
3. Pull latest audit data from Wave 1
4. Pull CWV data from Wave 1 tools

### Step 2: Compare to Baseline
1. Pull historical data from Supabase
2. Calculate standard deviation for key metrics
3. Flag any metric deviating more than 2 standard deviations

### Step 3: Cross-Reference Timing
1. Use `monitor_check_algorithm_updates` to check for recent Google updates
2. Check `seo_changes` table for recent site changes
3. Check `seo_content_log` for recent content changes

### Step 4: Diagnose
For each detected anomaly:
1. Run through the relevant diagnosis checklist above
2. Assign a probable cause (may be multiple)
3. Assign a confidence level (high / medium / low)
4. Generate specific recommendations

### Step 5: Store & Alert
Save to Supabase:
```
Table: seo_anomalies
- id, site_url, anomaly_type, severity (critical/warning/info)
- description, probable_cause, confidence
- affected_keywords (JSONB), affected_urls (JSONB)
- recommended_actions (JSONB), status (detected/investigating/resolved)
- detected_at, resolved_at
```

Alert via Gmail MCP if severity is critical.

### Step 6: Present
```
⚠️ SEO ANOMALY DETECTED — example.com

Type: Ranking Drop
Severity: 🔴 Critical
Detected: Mar 10, 2026

Affected Keywords (3):
  "home gym equipment"    #5 → #14  (↓ 9 positions)
  "best gym equipment"    #8 → #19  (↓ 11 positions)  
  "gym equipment online"  #3 → #11  (↓ 8 positions)

Probable Cause: Google Algorithm Update (March 2026 Core Update)
Confidence: High

Evidence:
  - All drops coincide with confirmed Google update on Mar 8
  - No technical changes detected on the site
  - Multiple competitors also shifted positions
  - Content quality patterns match update focus areas

Recommended Actions:
  1. Analyze the update's focus (use /seo-wave3:update-check)
  2. Review affected pages for content quality signals
  3. Check E-E-A-T signals on affected pages
  4. Monitor for recovery over next 2 weeks before making changes
  5. If no recovery by Mar 24: refresh content using /seo-wave2:write
```

## Continuous Monitoring

For always-on monitoring:
1. Schedule rank checks weekly (Google Calendar)
2. After each check, automatically run anomaly detection
3. Critical anomalies trigger immediate Gmail alerts
4. Warning-level anomalies collected into weekly digests
5. All anomalies tracked in Supabase for trend analysis
