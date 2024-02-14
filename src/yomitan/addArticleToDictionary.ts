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
  // const cleanHeadword = article.tag_name.trim();
  // Check for parentheses
  const { noBracketsHeadword, bracketContent } = parseHeadwordBrackets(
    article.tag_name,
  );
  entry.addDetailedDefinition(
    createDetailedDefinition(article, pixivLight, bracketContent),
  );
  await dictionary.addTerm(entry.build());
  // Add the clean headword without brackets if it exists
  if (bracketContent) {
    entry.setTerm(noBracketsHeadword);
    await dictionary.addTerm(entry.build());
  }
}

function parseHeadwordBrackets(headword: string): {
  noBracketsHeadword: string;
  bracketContent: string;
} {
  const results = headword.match(/^(.+)[(（]([^(（)）]+)[)）]$/);
  if (results) {
    const [, cleanHeadword, brackets] = results;
    return {
      noBracketsHeadword: cleanHeadword,
      bracketContent: brackets,
    };
  }
  return {
    noBracketsHeadword: '',
    bracketContent: '',
  };
}
