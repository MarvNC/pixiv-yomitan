import { PixivArticle } from '@prisma/client';
import {
  DetailedDefinition,
  StructuredContentNode,
} from 'yomichan-dict-builder/dist/types/yomitan/termbank';
import { createUlElement } from './createUlElement';

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
      listPrefix: '⧉',
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
  return {
    type: 'structured-content',
    content: scList,
  };
}
