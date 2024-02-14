import { PixivArticle } from '@prisma/client';
import { Dictionary, TermEntry } from 'yomichan-dict-builder';
import { getArticleProcessedReading } from '../helpers/getArticleProcessedReading';
import { createDetailedDefinition } from './createDetailedDefinition';

export async function addArticleToDictionary(
  article: PixivArticle,
  pixivLight: boolean,
  dictionary: Dictionary,
) {
  const entry = new TermEntry(article.tag_name);
  entry.setReading(getArticleProcessedReading(article));
  entry.addDetailedDefinition(createDetailedDefinition(article, pixivLight));
  await dictionary.addTerm(entry.build());
}
