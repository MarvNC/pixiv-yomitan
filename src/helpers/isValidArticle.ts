import { PixivArticle } from '@prisma/client';

const filteredParentCategories = new Set(['隔離記事', '荒らし記事','自演記事', '不要記事', '白紙化', '削除記事', '立て逃げ記事', '意味のない記事']);
const dashOnlySummaryPattern = /^[ー-]+$/;
const trailingSummaryPunctuationPattern = /[。．.、,!?！？]+$/u;
const parenthesizedSegmentPattern = /\([^()]*\)|（[^（）]*）/gu;
const endingVerbSuffixPattern =
  '(?:します|しました|しています|致します|致しました|させていただきます)?';
const blankingSummaryEndingPattern = new RegExp(
  `(白紙化${endingVerbSuffixPattern}|白紙化された記事です)$`,
  'u'
);
const deletionSummaryEndingPattern = new RegExp(
  `(?:削除|除去)${endingVerbSuffixPattern}$`,
  'u'
);
const abandonedArticleSummaryPattern =
  /立て逃げ記事(?:$|.*(?:につき|なので|であるため|のため|かつ|により))/u;
const unwantedArticleTerminalPattern = /不要記事(?:に)?$/u;
const unwantedArticleApplicablePattern = new RegExp(
  `不要記事に(?:該当)?${endingVerbSuffixPattern}$`,
  'u'
);
const unusedTagSummaryPattern = /^※?現在使われていないタグです$/u;
const definitionMarker = 'とは';
const invalidSummaryPatterns = [
  abandonedArticleSummaryPattern,
  unwantedArticleTerminalPattern,
  unwantedArticleApplicablePattern,
  unusedTagSummaryPattern,
  blankingSummaryEndingPattern,
  deletionSummaryEndingPattern,
  dashOnlySummaryPattern,
] as const;

function hasFilteredCategory(headers: string[]): boolean {
  return headers.some((category) => filteredParentCategories.has(category));
}

function isInvalidSummary(summary: string): boolean {
  return invalidSummaryPatterns.some((pattern) => pattern.test(summary));
}

function normalizeSummary(summary: string): string {
  return summary.trim().replace(trailingSummaryPunctuationPattern, '');
}

function stripParenthesizedSegments(summary: string): string {
  let previous = summary;
  let stripped = previous.replace(parenthesizedSegmentPattern, '');
  while (stripped !== previous) {
    previous = stripped;
    stripped = previous.replace(parenthesizedSegmentPattern, '');
  }
  return stripped;
}

export function isValidArticle(article: PixivArticle): boolean {
  // Check if article is in a troll category
  const parsedHeaders: unknown = JSON.parse(article.header || '[]');
  if (!Array.isArray(parsedHeaders)) {
    throw new Error(`Invalid headers: ${article.header}`);
  }

  const headers = parsedHeaders as string[];
  if (hasFilteredCategory(headers)) {
    return false;
  }

  // Filter deleted/blanked vandalism summaries.

  // Normalize summary by trimming and removing trailing punctuation for comparison.
  const normalizedSummary = normalizeSummary(article.summary);

  // If the summary contains the definition marker 'とは', it's likely a valid article, even if it has other patterns.
  if (normalizedSummary.includes(definitionMarker)) {
    return true;
  }

  // Ignore moderation notes that appear only inside parentheses.
  const normalizedSummaryWithoutParentheses = normalizeSummary(
    stripParenthesizedSegments(normalizedSummary)
  );

  if (
    normalizedSummaryWithoutParentheses &&
    isInvalidSummary(normalizedSummaryWithoutParentheses)
  ) {
    return false;
  }

  // If nothing meaningful remains after removing parenthesized segments,
  // fall back to the original summary so pure moderation notes still get filtered.
  if (
    !normalizedSummaryWithoutParentheses &&
    isInvalidSummary(normalizedSummary)
  ) {
    return false;
  }

  return true;
}
