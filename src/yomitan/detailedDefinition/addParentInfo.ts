import { PixivArticle } from '@prisma/client';
import { StructuredContentNode } from 'yomichan-dict-builder/dist/types/yomitan/termbank';

export function addParentInfo(
  article: PixivArticle,
  scList: StructuredContentNode[],
  bracketContent: string,
) {
  if (bracketContent) {
    scList.push({
      tag: 'div',
      content: `«${bracketContent}»`,
      style: {
        fontWeight: 'bold',
        fontSize: '1.3em',
        color: '#e5007f',
      },
      data: {
        pixiv: 'series',
      },
    });
  }

  if (article.parent) {
    scList.push({
      tag: 'div',
      data: {
        pixiv: 'parent-link',
      },
      style: {
        fontWeight: 'bold',
      },
      content: {
        tag: 'a',
        content: `←${article.parent}`,
        href: `?query=${article.parent}`,
      },
    });
  }
}
