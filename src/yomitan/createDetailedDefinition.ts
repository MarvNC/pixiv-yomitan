import { PixivArticle } from '@prisma/client';
import {
  DetailedDefinition,
  StructuredContentNode,
} from 'yomichan-dict-builder/dist/types/yomitan/termbank';
import { createUlElement } from './createUlElement';
import { addRelatedArticles } from './detailedDefinition/addRelatedArticles';
import { addFooter } from './detailedDefinition/addFooter';
import { addMainText } from './detailedDefinition/addMainText';
import { addParentInfo } from './detailedDefinition/addParentInfo';

export function createDetailedDefinition(
  article: PixivArticle,
  pixivLight: boolean,
  bracketContent: string,
): DetailedDefinition {
  const scList: StructuredContentNode = [];
  // Parent tag/bracket stuff
  addParentInfo(article, scList, bracketContent, pixivLight);
  // Summary
  if (article.summary) {
    scList.push(
      createUlElement({
        content: article.summary,
        data: { pixiv: 'summary' },
      }),
    );
  }
  if (!pixivLight) {
    // Main text
    addMainText(article, scList);
    // Add related articles
    addRelatedArticles(article, scList);
  }
  // Stats
  addFooter(scList, article);
  return {
    type: 'structured-content',
    content: scList,
  };
}
