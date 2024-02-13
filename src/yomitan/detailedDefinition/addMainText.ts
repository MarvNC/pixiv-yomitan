import { PixivArticle } from '@prisma/client';
import { StructuredContentNode } from 'yomichan-dict-builder/dist/types/yomitan/termbank';
import { createUlElement } from '../createUlElement';

export function addMainText(
  article: PixivArticle,
  scList: StructuredContentNode[],
) {
  if (!article.mainText) {
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
      content: article.mainText,
      data: { pixiv: 'main-text' },
      style: {
        listStyleType: 'none',
      },
    }),
  );
}
