import { PixivArticle } from '@prisma/client';

const trollCategories = ['荒らし記事'];
const invalidSummaryFragments = [
  '削除しました',
  '記事白紙化',
  '立て逃げ記事',
  '白紙化しました',
];
const dashOnlySummaryPattern = /^[ー-]+$/;
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
  const summary = article.summary.trim();
  if (
    invalidSummaryFragments.some((fragment) => summary.includes(fragment)) ||
    dashOnlySummaryPattern.test(summary.replace(/\s+/g, ''))
  ) {
    return false;
  }

  return true;
}
