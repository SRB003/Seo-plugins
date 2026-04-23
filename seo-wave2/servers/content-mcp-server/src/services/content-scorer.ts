import { CONTENT_CONSTANTS, type ContentScoreResult } from "../types.js";

/**
 * Count syllables in a word (rough English estimate)
 */
function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length <= 3) return 1;
  let count = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
    .replace(/^y/, "")
    .match(/[aeiouy]{1,2}/g);
  return count ? count.length : 1;
}

/**
 * Calculate Flesch Reading Ease score
 */
function fleschReadingEase(totalWords: number, totalSentences: number, totalSyllables: number): number {
  if (totalSentences === 0 || totalWords === 0) return 0;
  return 206.835 - 1.015 * (totalWords / totalSentences) - 84.6 * (totalSyllables / totalWords);
}

/**
 * Detect passive voice in a sentence (rough heuristic)
 */
function isPassiveVoice(sentence: string): boolean {
  const passivePattern = /\b(is|are|was|were|be|been|being)\s+(\w+ed|built|chosen|done|drawn|driven|eaten|fallen|felt|found|given|gone|grown|held|hidden|hit|hurt|kept|known|laid|led|left|lent|let|lost|made|meant|met|paid|put|read|run|said|seen|sent|set|shown|shut|sat|slept|sold|spoken|spent|stood|struck|taken|taught|thought|told|understood|won|worn|written)\b/i;
  return passivePattern.test(sentence);
}

/**
 * Check if a sentence starts with a transition word
 */
function hasTransitionWord(sentence: string): boolean {
  const transitions = [
    "however", "additionally", "furthermore", "moreover", "therefore",
    "consequently", "meanwhile", "nevertheless", "in addition", "for example",
    "for instance", "in contrast", "on the other hand", "similarly",
    "as a result", "in fact", "specifically", "notably", "importantly",
    "first", "second", "third", "finally", "next", "then", "also",
    "besides", "likewise", "instead", "rather", "still", "yet",
    "accordingly", "hence", "thus", "so", "because", "since",
    "although", "though", "while", "whereas",
  ];
  const lower = sentence.toLowerCase().trim();
  return transitions.some((t) => lower.startsWith(t));
}

/**
 * Score content against the SEO scorecard
 */
export function scoreContent(
  content: string,
  primaryKeyword: string,
  secondaryKeywords: string[] = [],
  targetWordCount?: number,
  metaTitle?: string,
  metaDescription?: string,
  slug?: string
): ContentScoreResult {
  const lines = content.split("\n").filter((l) => l.trim());
  const plainText = content.replace(/#{1,6}\s*/g, "").replace(/[*_`~\[\]()]/g, "");
  const words = plainText.split(/\s+/).filter((w) => w.length > 0);
  const totalWords = words.length;
  const sentences = plainText.split(/[.!?]+/).filter((s) => s.trim().length > 5);
  const totalSentences = sentences.length;
  const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0);

  // Extract headings
  const h1Matches = content.match(/^#\s+(.+)$/gm) || [];
  const h2Matches = content.match(/^##\s+(.+)$/gm) || [];
  const h3Matches = content.match(/^###\s+(.+)$/gm) || [];

  const h1Text = h1Matches.map((h) => h.replace(/^#\s+/, ""));
  const h2Text = h2Matches.map((h) => h.replace(/^##\s+/, ""));

  const lowerContent = plainText.toLowerCase();
  const lowerKeyword = primaryKeyword.toLowerCase();

  // Count keyword occurrences
  const keywordRegex = new RegExp(lowerKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  const keywordCount = (plainText.match(keywordRegex) || []).length;
  const keywordDensity = totalWords > 0 ? keywordCount / totalWords : 0;

  // Split content into paragraphs
  const paragraphs = content.split(/\n\s*\n/).filter((p) => p.trim() && !p.trim().startsWith("#"));

  // ─── SCORING ───

  const issues: Record<string, string[]> = {
    keywordOptimization: [],
    contentStructure: [],
    readability: [],
    technicalSeo: [],
    contentQuality: [],
    engagement: [],
  };
  const strengths: string[] = [];

  // === 1. Keyword Optimization (25 pts) ===
  let kwScore = 0;

  // H1 contains keyword (5)
  if (h1Text.some((h) => h.toLowerCase().includes(lowerKeyword))) {
    kwScore += 5;
    strengths.push("Primary keyword in H1");
  } else {
    issues.keywordOptimization.push("Primary keyword missing from H1");
  }

  // First 100 words (5)
  const first100 = words.slice(0, 100).join(" ").toLowerCase();
  if (first100.includes(lowerKeyword)) {
    kwScore += 5;
    strengths.push("Keyword in first 100 words");
  } else {
    issues.keywordOptimization.push("Primary keyword not in first 100 words");
  }

  // H2 contains keyword (3)
  if (h2Text.some((h) => h.toLowerCase().includes(lowerKeyword))) {
    kwScore += 3;
  } else {
    issues.keywordOptimization.push("No H2 contains the primary keyword");
  }

  // Conclusion keyword (3)
  const last150 = words.slice(-150).join(" ").toLowerCase();
  if (last150.includes(lowerKeyword)) {
    kwScore += 3;
  } else {
    issues.keywordOptimization.push("Primary keyword missing from conclusion");
  }

  // Density 1-2% (4)
  if (keywordDensity >= CONTENT_CONSTANTS.IDEAL_KEYWORD_DENSITY_MIN && keywordDensity <= CONTENT_CONSTANTS.IDEAL_KEYWORD_DENSITY_MAX) {
    kwScore += 4;
    strengths.push(`Keyword density at ${(keywordDensity * 100).toFixed(1)}%`);
  } else if (keywordDensity < CONTENT_CONSTANTS.IDEAL_KEYWORD_DENSITY_MIN) {
    kwScore += 1;
    issues.keywordOptimization.push(`Keyword density too low (${(keywordDensity * 100).toFixed(1)}%, target 1-2%)`);
  } else {
    kwScore += 1;
    issues.keywordOptimization.push(`Keyword density too high (${(keywordDensity * 100).toFixed(1)}%, may look like stuffing)`);
  }

  // Secondary keywords (3)
  const secondariesFound = secondaryKeywords.filter((sk) => lowerContent.includes(sk.toLowerCase()));
  if (secondariesFound.length >= 3) {
    kwScore += 3;
  } else if (secondariesFound.length >= 1) {
    kwScore += 1;
    issues.keywordOptimization.push(`Only ${secondariesFound.length}/${secondaryKeywords.length} secondary keywords found`);
  } else if (secondaryKeywords.length > 0) {
    issues.keywordOptimization.push("No secondary keywords found in content");
  } else {
    kwScore += 3; // No secondaries provided, don't penalize
  }

  // No stuffing (2)
  if (keywordDensity <= CONTENT_CONSTANTS.IDEAL_KEYWORD_DENSITY_MAX) {
    kwScore += 2;
  }

  // === 2. Content Structure (20 pts) ===
  let structScore = 0;

  // Single proper H1 (4)
  if (h1Matches.length === 1) {
    structScore += 4;
    strengths.push("Proper single H1");
  } else if (h1Matches.length === 0) {
    issues.contentStructure.push("Missing H1 heading");
  } else {
    issues.contentStructure.push(`Multiple H1 tags found (${h1Matches.length})`);
    structScore += 1;
  }

  // Logical hierarchy (4)
  if (h2Matches.length > 0) {
    structScore += 4;
  } else {
    issues.contentStructure.push("No H2 headings — content lacks structure");
  }

  // Heading count ratio (3)
  const headingRatio = totalWords / Math.max(1, h2Matches.length);
  if (headingRatio <= CONTENT_CONSTANTS.MIN_HEADING_RATIO) {
    structScore += 3;
  } else {
    structScore += 1;
    issues.contentStructure.push(`Too few headings — 1 H2 per ${Math.round(headingRatio)} words (target: 1 per ${CONTENT_CONSTANTS.MIN_HEADING_RATIO})`);
  }

  // Introduction (3)
  if (lines.length > 0 && !lines[0].startsWith("#")) {
    structScore += 3;
  } else if (lines.length > 1 && !lines[1].startsWith("#")) {
    structScore += 3;
  } else {
    issues.contentStructure.push("Missing introduction paragraph before first section");
  }

  // Conclusion (3)
  const lastFewLines = lines.slice(-5).join(" ").toLowerCase();
  if (lastFewLines.length > 50) {
    structScore += 3;
  } else {
    issues.contentStructure.push("Conclusion appears too short or missing");
  }

  // TOC viability for long content (3)
  if (totalWords > 1500 && h2Matches.length >= 4) {
    structScore += 3;
  } else if (totalWords <= 1500) {
    structScore += 3; // Not applicable for short content
  } else {
    issues.contentStructure.push("Long article (1500+ words) needs more H2 sections for table of contents");
  }

  // === 3. Readability (20 pts) ===
  let readScore = 0;

  // Avg sentence length (4)
  const avgSentenceLen = totalWords / Math.max(1, totalSentences);
  if (avgSentenceLen <= CONTENT_CONSTANTS.IDEAL_SENTENCE_LENGTH) {
    readScore += 4;
    strengths.push(`Average sentence length: ${avgSentenceLen.toFixed(1)} words`);
  } else {
    readScore += 1;
    issues.readability.push(`Average sentence length too high (${avgSentenceLen.toFixed(1)} words, target ≤ ${CONTENT_CONSTANTS.IDEAL_SENTENCE_LENGTH})`);
  }

  // Paragraph length (4)
  const longParagraphs = paragraphs.filter((p) => {
    const pSentences = p.split(/[.!?]+/).filter((s) => s.trim().length > 5);
    return pSentences.length > CONTENT_CONSTANTS.MAX_PARAGRAPH_SENTENCES;
  });
  if (longParagraphs.length === 0) {
    readScore += 4;
  } else {
    readScore += Math.max(0, 4 - longParagraphs.length);
    issues.readability.push(`${longParagraphs.length} paragraph(s) exceed ${CONTENT_CONSTANTS.MAX_PARAGRAPH_SENTENCES} sentences`);
  }

  // Transition words (3)
  const transitionCount = sentences.filter(hasTransitionWord).length;
  const transitionRate = transitionCount / Math.max(1, totalSentences);
  if (transitionRate >= 0.25) {
    readScore += 3;
  } else {
    readScore += 1;
    issues.readability.push(`Low transition word usage (${(transitionRate * 100).toFixed(0)}%, target ≥ 25%)`);
  }

  // Flesch (4)
  const flesch = fleschReadingEase(totalWords, totalSentences, totalSyllables);
  if (flesch >= CONTENT_CONSTANTS.MIN_FLESCH_SCORE) {
    readScore += 4;
    strengths.push(`Flesch reading ease: ${flesch.toFixed(0)}`);
  } else {
    readScore += 1;
    issues.readability.push(`Flesch reading ease too low (${flesch.toFixed(0)}, target ≥ ${CONTENT_CONSTANTS.MIN_FLESCH_SCORE})`);
  }

  // Active voice (3)
  const passiveCount = sentences.filter(isPassiveVoice).length;
  const activeRate = 1 - passiveCount / Math.max(1, totalSentences);
  if (activeRate >= 0.8) {
    readScore += 3;
    strengths.push(`Active voice at ${(activeRate * 100).toFixed(0)}%`);
  } else {
    readScore += 1;
    issues.readability.push(`Too much passive voice (${(passiveCount)} passive sentences, target < 20%)`);
  }

  // No filler (2)
  const fillerFound = CONTENT_CONSTANTS.FILLER_PHRASES.filter((f) => lowerContent.includes(f));
  if (fillerFound.length === 0) {
    readScore += 2;
  } else {
    issues.readability.push(`Filler phrases detected: "${fillerFound.join('", "')}`);
  }

  // === 4. Technical SEO (15 pts) ===
  let techScore = 0;

  if (metaTitle) {
    if (metaTitle.length <= 60 && metaTitle.toLowerCase().includes(lowerKeyword)) {
      techScore += 3;
    } else {
      techScore += 1;
      if (metaTitle.length > 60) issues.technicalSeo.push(`Meta title too long (${metaTitle.length} chars)`);
      if (!metaTitle.toLowerCase().includes(lowerKeyword)) issues.technicalSeo.push("Meta title missing primary keyword");
    }
  } else {
    issues.technicalSeo.push("No meta title provided");
  }

  if (metaDescription) {
    if (metaDescription.length >= 150 && metaDescription.length <= 160) {
      techScore += 3;
    } else {
      techScore += 1;
      issues.technicalSeo.push(`Meta description length: ${metaDescription.length} chars (target 150-160)`);
    }
  } else {
    issues.technicalSeo.push("No meta description provided");
  }

  if (slug) {
    const cleanSlug = slug.toLowerCase();
    if (cleanSlug.includes(lowerKeyword.replace(/\s+/g, "-"))) {
      techScore += 2;
    } else {
      techScore += 1;
      issues.technicalSeo.push("URL slug doesn't contain primary keyword");
    }
  } else {
    techScore += 2; // Not applicable
  }

  // Internal links check (look for markdown links)
  const internalLinkMatches = content.match(/\[.+?\]\(.+?\)/g) || [];
  if (internalLinkMatches.length >= 3) {
    techScore += 3;
  } else if (internalLinkMatches.length >= 1) {
    techScore += 1;
    issues.technicalSeo.push(`Only ${internalLinkMatches.length} internal links (target ≥ 3)`);
  } else {
    issues.technicalSeo.push("No internal links found");
  }

  // External links
  const externalLinkCount = internalLinkMatches.filter((l) => l.includes("http")).length;
  if (externalLinkCount >= 2) {
    techScore += 2;
  } else if (externalLinkCount >= 1) {
    techScore += 1;
    issues.technicalSeo.push("Only 1 external reference link (target ≥ 2)");
  } else {
    issues.technicalSeo.push("No external authority links");
  }

  // Image alt text (2)
  techScore += 2; // Give benefit of doubt — images assessed separately

  // === 5. Content Quality (10 pts) ===
  let qualityScore = 0;

  if (targetWordCount) {
    const ratio = totalWords / targetWordCount;
    if (ratio >= 0.9 && ratio <= 1.1) {
      qualityScore += 3;
      strengths.push(`Word count on target: ${totalWords}/${targetWordCount}`);
    } else {
      qualityScore += 1;
      issues.contentQuality.push(`Word count: ${totalWords} (target: ${targetWordCount}, ${ratio < 1 ? "under" : "over"} by ${Math.abs(totalWords - targetWordCount)})`);
    }
  } else {
    qualityScore += 3;
  }

  // Specific data (numbers, stats) (3)
  const numberMatches = plainText.match(/\d+%|\$\d+|\d+\.\d+|\b\d{2,}\b/g) || [];
  if (numberMatches.length >= 5) {
    qualityScore += 3;
    strengths.push("Good use of specific data and numbers");
  } else if (numberMatches.length >= 2) {
    qualityScore += 2;
  } else {
    qualityScore += 1;
    issues.contentQuality.push("Content lacks specific data, numbers, or statistics");
  }

  // Unique angle (2) — hard to auto-detect, give partial credit
  qualityScore += 1;

  // Intent match (2) — give credit if structure looks appropriate
  qualityScore += 1;

  // === 6. Engagement (10 pts) ===
  let engScore = 0;

  // Lists (2)
  const hasList = content.includes("- ") || content.includes("1. ");
  if (hasList) {
    engScore += 2;
    strengths.push("Contains lists for scannability");
  } else {
    issues.engagement.push("No lists or bullet points — add for scannability");
  }

  // Table (2)
  const hasTable = content.includes("|") && content.includes("---");
  if (hasTable) {
    engScore += 2;
  } else {
    issues.engagement.push("No tables — consider adding structured data comparisons");
  }

  // CTA (2)
  const ctaPatterns = /\b(sign up|subscribe|learn more|get started|contact us|try|download|read more|check out|click)\b/i;
  if (ctaPatterns.test(plainText)) {
    engScore += 2;
  } else {
    issues.engagement.push("No clear call-to-action detected");
  }

  // Featured snippet (2) — check for concise answer after a H2
  engScore += 1; // Partial — hard to auto-detect

  // Social meta (2)
  engScore += 1; // Partial — assessed with technical

  // === TOTAL ===
  const totalScore = kwScore + structScore + readScore + techScore + qualityScore + engScore;

  const rating: ContentScoreResult["rating"] =
    totalScore >= 90 ? "excellent" :
    totalScore >= 75 ? "good" :
    totalScore >= 60 ? "fair" :
    totalScore >= 40 ? "poor" : "failing";

  return {
    totalScore,
    categories: {
      keywordOptimization: { score: kwScore, max: 25, issues: issues.keywordOptimization },
      contentStructure: { score: structScore, max: 20, issues: issues.contentStructure },
      readability: { score: readScore, max: 20, issues: issues.readability },
      technicalSeo: { score: techScore, max: 15, issues: issues.technicalSeo },
      contentQuality: { score: qualityScore, max: 10, issues: issues.contentQuality },
      engagement: { score: engScore, max: 10, issues: issues.engagement },
    },
    strengths,
    rating,
  };
}
