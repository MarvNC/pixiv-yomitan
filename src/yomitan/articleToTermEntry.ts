import { PixivArticle } from '@prisma/client';
import { TermEntry } from 'yomichan-dict-builder';
import { getArticleProcessedReading } from '../helpers/getArticleProcessedReading';
import { createDetailedDefinition } from './createDetailedDefinition';

export function articleToTermEntry(article: PixivArticle): TermEntry {
  const entry = new TermEntry(article.tag_name);
  entry.setReading(getArticleProcessedReading(article));
  entry.addDetailedDefinition(createDetailedDefinition(article));
  return entry;
}
