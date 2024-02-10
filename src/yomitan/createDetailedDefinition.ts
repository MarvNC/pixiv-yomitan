import { PixivArticle } from '@prisma/client';
import {
  DetailedDefinition,
  StructuredContentNode,
} from 'yomichan-dict-builder/dist/types/yomitan/termbank';
import { createUlElement } from './createUlElement';

const viewsLabel = '閲覧数';
const illustrationCountLabel = '作品数';
const readMoreLabel = '続きを読む';
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
        content: readMoreLabel,
      },
      data: {
        pixiv: 'read-more-link',
      },
      listPrefix: readMoreEmoji,
    }),
  );
  // scList.push({
  //   tag: 'span',
  //   content: `${viewsLabel}${article.view_count} ${illustrationCountLabel}${article.illust_count}`,
  // });
  return {
    type: 'structured-content',
    content: scList,
  };
}
