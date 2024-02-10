import { PixivArticle } from '@prisma/client';
import {
  DetailedDefinition,
  StructuredContentNode,
} from 'yomichan-dict-builder/dist/types/yomitan/termbank';
import { createUlElement } from './createUlElement';

const viewsLabel = '閲覧数';
const illustrationCountLabel = '作品数';
const readMoreEmoji = '⧉';
export function createDetailedDefinition(
  article: PixivArticle,
): DetailedDefinition {
  const scList: StructuredContentNode = [];
  // Parent tag
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
          href: `?query=${article.parent}&wildcards=off`,
        },
        {
          tag: 'span',
          content: '»',
        },
      ],
    });
  }
  // Summary
  scList.push(
    createUlElement({ content: article.summary, data: { pixiv: 'summary' } }),
  );
  // Read more link
  scList.push(
    createUlElement({
      content: {
        tag: 'a',
        href: `https://dic.pixiv.net/a/${article.tag_name}`,
        content: 'pixivで続きを読む',
      },
      data: {
        pixiv: 'read-more-link',
      },
      listPrefix: readMoreEmoji,
    }),
  );
  // Stats
  scList.push({
    tag: 'div',
    style: {
      textAlign: 'right',
    },
    data: {
      pixiv: 'stats',
    },
    content: [
      `${viewsLabel}: ${article.view_count} | `,
      {
        tag: 'a',
        href: `https://www.pixiv.net/tags.php?tag=${article.tag_name}`,
        content: `${illustrationCountLabel}: ${article.illust_count}`,
      },
    ],
  });
  return {
    type: 'structured-content',
    content: scList,
  };
}
