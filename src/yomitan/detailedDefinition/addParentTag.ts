import { PixivArticle } from '@prisma/client';
import { StructuredContentNode } from 'yomichan-dict-builder/dist/types/yomitan/termbank';

export function addParentTag(
  article: PixivArticle,
  scList: StructuredContentNode[],
) {
  if (article.parent) {
    scList.push({
      tag: 'div',
      data: {
        pixiv: 'parent-tag',
      },
      style: {
        fontWeight: 'bold',
        textDecorationStyle: 'dashed',
      },
      content: [
        {
          tag: 'a',
          content: `←${article.parent}`,
          href: `?query=${article.parent}`,
        },
      ],
    });
  }
}
