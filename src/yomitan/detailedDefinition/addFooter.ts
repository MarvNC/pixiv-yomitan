import { PixivArticle } from '@prisma/client';
import { StructuredContentNode } from 'yomichan-dict-builder/dist/types/yomitan/termbank';
import { createImageNode } from './assetsFolder';

export function addFooter(
  scList: StructuredContentNode[],
  article: PixivArticle,
) {
  scList.push({
    tag: 'div',
    style: {
      textAlign: 'right',
      marginTop: '0.4em',
    },
    data: {
      pixiv: 'stats',
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
      ' | ',
      {
        tag: 'span',
        style: {
          cursor: 'pointer',
        },
        content: `👁 ${article.view_count}`,
        title: '閲覧数',
      },
      ' | ',
      {
        tag: 'span',
        style: {
          cursor: 'pointer',
        },
        content: `🖼️ `,
        title: 'pixivイラスト数',
      },
      {
        tag: 'a',
        href: `https://www.pixiv.net/tags.php?tag=${article.tag_name}`,
        content: `${article.illust_count}作品`,
      },
    ],
  });
}
