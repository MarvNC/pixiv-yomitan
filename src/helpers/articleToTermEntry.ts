import { normalizeReading } from 'japanese-furigana-normalize';
import { PixivArticle } from '@prisma/client';
import { TermEntry } from 'yomichan-dict-builder';

export function articleToTermEntry(article: PixivArticle): TermEntry {
  const entry = new TermEntry(article.tag_name);
  entry.setReading(getReading(article));
  return entry;
}

function getReading(article: PixivArticle): string {
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
