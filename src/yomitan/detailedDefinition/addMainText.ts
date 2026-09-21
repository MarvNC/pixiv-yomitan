import { PixivArticle } from '@prisma/client';
import { StructuredContentNode } from 'yomichan-dict-builder/dist/types/yomitan/termbank';
import { createUlElement } from '../createUlElement';

export function addMainText(
  article: PixivArticle,
  scList: StructuredContentNode[],
) {
  // Some historical scrape results start with blank lines when the article
  // has no abstract. Keep all other whitespace and paragraph breaks intact.
  const mainText = article.mainText?.replace(/^[\r\n]+/, '');
  if (!mainText) {
    return;
  }
  scList.push(
    {
      tag: 'div',
      content: '概要',
      data: { pixiv: 'main-text-title' },
      style: {
        fontWeight: 'bold',
      },
    },
    createUlElement({
      content: mainText,
      data: { pixiv: 'main-text' },
      style: {
        listStyleType: 'none',
      },
    }),
  );
}
