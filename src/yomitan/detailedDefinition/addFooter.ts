import { PixivArticle } from '@prisma/client';
import { StructuredContentNode } from 'yomichan-dict-builder/dist/types/yomitan/termbank';
import { createImageNode } from './createImageNode';

export function addFooter(
  scList: StructuredContentNode[],
  article: PixivArticle,
) {
  scList.push({
    tag: 'div',
    data: {
      pixiv: 'footer',
    },
    content: [
      {
        tag: 'span',
        content: [
          createImageNode({
            filePath: 'pixiv-logo.png',
            alt: 'pixiv',
          }),
          ' ',
          {
            tag: 'a',
            href: `https://dic.pixiv.net/a/${article.tag_name}`,
            content: 'pixivで読む',
          },
        ],
        data: {
          pixiv: 'read-more-link',
        },
      },
    ],
  });
}
