import { PixivArticle } from '@prisma/client';
import { StructuredContentNode } from 'yomichan-dict-builder/dist/types/yomitan/termbank';

export function addParentInfo(
  article: PixivArticle,
  scList: StructuredContentNode[],
  bracketContent: string,
) {
  if (!article.parent && !bracketContent) {
    return;
  }

  const parentSCArr: StructuredContentNode = [];

  if (bracketContent && bracketContent !== article.parent) {
    parentSCArr.push({
      tag: 'div',
      content: `(${bracketContent})`,
    });
  }

  if (article.parent) {
    parentSCArr.push({
      tag: 'a',
      content: `←${article.parent}`,
      href: `?query=${article.parent}`,
    });
  }

  scList.push({
    tag: 'div',
    data: {
      pixiv: 'parent-info',
    },
    style: {
      fontWeight: 'bold',
      textDecorationStyle: 'dashed',
    },
    content: parentSCArr,
  });
}
