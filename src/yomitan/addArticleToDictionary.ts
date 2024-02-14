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
  // Check for parentheses
  const { cleanHeadword, bracketContent } = getCleanHeadword(article.tag_name);
  entry.addDetailedDefinition(
    createDetailedDefinition(
      article,
      pixivLight,
      cleanHeadword,
      bracketContent,
    ),
  );
  if (bracketContent) {
    // TODO
  }
  await dictionary.addTerm(entry.build());
}

function getCleanHeadword(headword: string): {
  cleanHeadword: string;
  bracketContent: string;
} {
  const results = headword.match(/^(.+)[(（]([^(（)）]+)[)）]$/);
  if (results) {
    const [, cleanHeadword, brackets] = results;
    return {
      cleanHeadword,
      bracketContent: brackets,
    };
  }
  return {
    cleanHeadword: '',
    bracketContent: '',
  };
}
