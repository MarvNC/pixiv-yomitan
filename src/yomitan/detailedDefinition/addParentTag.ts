import { PixivArticle } from '@prisma/client';
import { StructuredContentNode } from 'yomichan-dict-builder/dist/types/yomitan/termbank';

export function addParentTag(article: PixivArticle, scList: StructuredContentNode[]) {
  if (article.parent) {
    scList.push({
      tag: 'div',
      data: {
        pixiv: 'parent-tag',
      },
      style: {
        color: '#e5007f',
      },
      content: [
        {
          tag: 'span',
          content: '«',
        },
        {
          tag: 'a',
          content: article.parent,
          href: `?query=${article.parent}`,
        },
        {
          tag: 'span',
          content: '»',
        },
      ],
    });
  }
}
