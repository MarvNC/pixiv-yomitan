import { normalizeReading } from 'japanese-furigana-normalize';
import { PixivArticle } from '@prisma/client';
import { TermEntry } from 'yomichan-dict-builder';

export function articleToTermEntry(article: PixivArticle): TermEntry {
  const entry = new TermEntry(article.tag_name);
  if (article.reading) {
    const normalizedReading = normalizeReading(
      article.tag_name,
      article.reading,
    );

    entry.setReading(normalizedReading);
  } else {
    entry.setReading('');
  }
  return entry;
}
