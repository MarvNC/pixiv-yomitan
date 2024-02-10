import { PixivArticle } from '@prisma/client';

const trollCategories = ['荒らし記事'];
const deletedArticleText = '削除しました';
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
  // Deleted article
  if (article.summary === deletedArticleText) {
    return false;
  }

  return true;
}
