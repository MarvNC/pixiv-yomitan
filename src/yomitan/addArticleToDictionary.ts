import { PixivArticle } from '@prisma/client';
import { Dictionary, TermEntry } from 'yomichan-dict-builder';
import { getArticleProcessedReading } from '../helpers/getArticleProcessedReading';
import { createDetailedDefinition } from './createDetailedDefinition';

export async function addArticleToDictionary(
  article: PixivArticle,
  pixivLight: boolean,
  dictionary: Dictionary,
) {
  const cleanHeadword = article.tag_name.trim();

  const entry = new TermEntry(cleanHeadword);

  // Check for parentheses
  const { noBracketsHeadword, bracketContent } =
    parseHeadwordBrackets(cleanHeadword);

  entry.setReading(getArticleProcessedReading(cleanHeadword, article.reading));

  entry.setPopularity(article.view_count);

  entry.addDetailedDefinition(
    createDetailedDefinition(article, pixivLight, bracketContent),
  );

  await dictionary.addTerm(entry.build());

  // Add the clean headword without brackets if it exists
  if (bracketContent) {
    entry.setTerm(noBracketsHeadword);
    entry.setReading(
      getArticleProcessedReading(noBracketsHeadword, article.reading),
    );
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
