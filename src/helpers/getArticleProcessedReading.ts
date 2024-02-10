import { normalizeReading } from 'japanese-furigana-normalize';
import { PixivArticle } from '@prisma/client';

export function getArticleProcessedReading(article: PixivArticle): string {
  if (!article.reading) {
    return '';
  }
  // ー is a common placeholder for missing readings
  if (article.reading === 'ー') {
    return '';
  }
  const normalizedReading = normalizeReading(article.tag_name, article.reading);
  return normalizedReading;
}
