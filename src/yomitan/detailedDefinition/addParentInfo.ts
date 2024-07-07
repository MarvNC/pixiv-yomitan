import { PixivArticle } from '@prisma/client';
import { StructuredContentNode } from 'yomichan-dict-builder/dist/types/yomitan/termbank';

export function addParentInfo(
  article: PixivArticle,
  scList: StructuredContentNode[],
  bracketContent: string,
  pixivLight: boolean,
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

  if (article.header) {
    const headerArray = JSON.parse(article.header) as string[];
    if (!Array.isArray(headerArray)) {
      throw new Error('header should be an array');
    }
    if (headerArray.length <= 2) {
      return;
    }
    // Remove last element (current article)
    headerArray.pop();
    const parent = headerArray.pop();
    if (!parent) {
      return;
    }
    headerArray.reverse();
    const parentLink: StructuredContentNode = {
      tag: 'a',
      content: `←${parent}`,
      href: `?query=${parent}`,
    };
    const contentListInsideDetails: StructuredContentNode[] = [
      {
        tag: 'summary',
        content: parentLink,
      },
    ];
    if (headerArray.length > 1) {
      // Create ul list of breadcrumbs within details block
      contentListInsideDetails.push({
        tag: 'ul',
        content: headerArray.map((header) => ({
          tag: 'li',
          content: {
            tag: 'a',
            content: header,
            href: `?query=${header}`,
          },
        })),
        data: {
          pixiv: 'series',
        },
      });
    }
    scList.push({
      tag: 'div',
      data: {
        pixiv: 'parent-link',
      },
      style: {
        fontWeight: 'bold',
      },
      // If lightweight mode, just show parent link, otherwise show list of breadcrumbs
      content: pixivLight
        ? parentLink
        : {
            tag: 'details',
            content: contentListInsideDetails,
          },
    });
  }
}
