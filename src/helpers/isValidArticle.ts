import { PixivArticle } from '@prisma/client';

const filteredParentCategories = new Set(['荒らし記事', '不要記事', '削除記事', '立て逃げ記事', '意味のない記事']);
const dashOnlySummaryPattern = /^[ー-]+$/;
const trailingSummaryPunctuationPattern = /[。．.、,!?！？]+$/u;
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
  /立て逃げ記事(?:$|[、,\s]*(?:につき|なので|であるため|のため|かつ|により))/u;
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

function hasFilteredParentCategory(headers: string[]): boolean {
  const parentCategories = headers.slice(0, -1);
  return parentCategories.some((category) =>
    filteredParentCategories.has(category)
  );
}

function isInvalidSummary(summary: string): boolean {
  return invalidSummaryPatterns.some((pattern) => pattern.test(summary));
}

export function isValidArticle(article: PixivArticle): boolean {
  // Check if article is in a troll category
  const parsedHeaders: unknown = JSON.parse(article.header || '[]');
  if (!Array.isArray(parsedHeaders)) {
    throw new Error(`Invalid headers: ${article.header}`);
  }

  const headers = parsedHeaders as string[];
  if (hasFilteredParentCategory(headers)) {
    return false;
  }

  // Filter deleted/blanked vandalism summaries.

  // Normalize summary by trimming and removing trailing punctuation for comparison.
  const normalizedSummary = article.summary
    .trim()
    .replace(trailingSummaryPunctuationPattern, '');

  // If the summary contains the definition marker 'とは', it's likely a valid article, even if it has other patterns.
  if (normalizedSummary.includes(definitionMarker)) {
    return true;
  }

  if (isInvalidSummary(normalizedSummary)) {
    return false;
  }

  return true;
}
