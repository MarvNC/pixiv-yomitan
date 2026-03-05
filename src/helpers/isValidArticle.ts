import { PixivArticle } from '@prisma/client';

const trollCategories = ['荒らし記事'];
const dashOnlySummaryPattern = /^[ー-]+$/;
const endingVerbSuffixPattern = '(?:します|しました|しています|致します|致しました)?';
const blankingSummaryEndingPattern = new RegExp(
  `(白紙化${endingVerbSuffixPattern}|白紙化された記事です)$`,
  'u'
);
const deletionSummaryEndingPattern = new RegExp(
  `削除${endingVerbSuffixPattern}$`,
  'u'
);
const abandonedArticleSummaryPattern =
  /立て逃げ記事(?:$|[、,\s]*(?:につき|なので|であるため|のため|かつ))/u;
const definitionMarker = 'とは';

export function isValidArticle(article: PixivArticle): boolean {
  // Check if article is in a troll category
  const headers: string[] = JSON.parse(article.header || '[]');
  if (!Array.isArray(headers)) {
    throw new Error(`Invalid headers: ${article.header}`);
  }
  const parentCategories = headers.slice(0, -1);
  for (const category of trollCategories) {
    if (parentCategories.includes(category)) {
      return false;
    }
  }

  // Filter deleted/blanked vandalism summaries.

  // Normalize summary by trimming and removing trailing '。' characters for comparison.
  const normalizedSummary = article.summary.trim().replace(/。+$/u, '');
  if (normalizedSummary.includes(definitionMarker)) {
    return true;
  }

  if (
    abandonedArticleSummaryPattern.test(normalizedSummary) ||
    blankingSummaryEndingPattern.test(normalizedSummary) ||
    deletionSummaryEndingPattern.test(normalizedSummary) ||
    dashOnlySummaryPattern.test(normalizedSummary)
  ) {
    return false;
  }

  return true;
}
