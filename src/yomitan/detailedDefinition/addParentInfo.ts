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
  if (article.parent) {
    parentSCArr.push({
      tag: 'a',
      content: `←${article.parent}`,
      href: `?query=${article.parent}`,
    });
  }
  if (bracketContent && bracketContent !== article.parent) {
    parentSCArr.push({
      tag: 'span',
      content: ` (${bracketContent})`,
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
