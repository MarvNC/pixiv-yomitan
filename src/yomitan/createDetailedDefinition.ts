import { PixivArticle } from '@prisma/client';
import {
  DetailedDefinition,
  StructuredContentNode,
} from 'yomichan-dict-builder/dist/types/yomitan/termbank';
import { createUlElement } from './createUlElement';

export function createDetailedDefinition(
  article: PixivArticle,
  pixivLight: boolean,
): DetailedDefinition {
  const scList: StructuredContentNode = [];
  // Parent tag
  addParentTag(article, scList);
  // Summary
  scList.push(
    createUlElement({
      content: article.summary,
      data: { pixiv: 'summary' },
    }),
  );
  if (!pixivLight) {
    // Main text
    addMainText(article, scList);
    // Add related articles
    addRelatedArticles(article, scList);
  }
  // Read more link
  addReadMore(scList, article);
  // Stats
  addStats(scList, article);
  return {
    type: 'structured-content',
    content: scList,
  };
}

import path from 'path';
const assetsFolder = 'assets';

function addRelatedArticles(
  article: PixivArticle,
  scList: StructuredContentNode[],
) {
  const related: string[] = JSON.parse(article.related_tags);
  if (!Array.isArray(related)) {
    throw new Error('related_tags should be an array');
  }
  if (related.length > 0) {
    scList.push({
      tag: 'div',
      content: '関連記事',
      data: { pixiv: 'related-tags-title' },
      style: {
        fontWeight: 'bold',
      },
    });
    const relatedArticlesArray: StructuredContentNode[] = [];
    for (const tag of related) {
      relatedArticlesArray.push(
        {
          tag: 'a',
          href: `?query=${tag}`,
          content: tag,
        },
        '・',
      );
    }
    // Remove last '・'
    relatedArticlesArray.pop();
    scList.push(
      createUlElement({
        content: {
          tag: 'div',
          content: relatedArticlesArray,
        },
        data: { pixiv: 'related-tags' },
        listStyleType: 'none',
      }),
    );
  }
}

function addStats(scList: StructuredContentNode[], article: PixivArticle) {
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
}

function addReadMore(scList: StructuredContentNode[], article: PixivArticle) {
  scList.push({
    tag: 'div',
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
  });
}

function addMainText(article: PixivArticle, scList: StructuredContentNode[]) {
  if (article.mainText) {
    scList.push(
      {
        tag: 'div',
        content: '概要',
        data: { pixiv: 'main-text-title' },
        style: {
          fontWeight: 'bold',
        },
      },
      createUlElement({
        content: article.mainText,
        data: { pixiv: 'main-text' },
        listStyleType: 'none',
      }),
    );
  }
}

function addParentTag(article: PixivArticle, scList: StructuredContentNode[]) {
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
          href: `?query=${article.parent}`,
        },
        {
          tag: 'span',
          content: '»',
        },
      ],
    });
  }
}

function createImageNode({
  filePath,
  alt,
}: {
  filePath: string;
  alt: string;
}): StructuredContentNode {
  return {
    tag: 'img',
    path: path.join(assetsFolder, filePath),
    alt: alt,
    collapsed: false,
    collapsible: false,
    height: 1,
    width: 1,
    sizeUnits: 'em',
    verticalAlign: 'middle',
  };
}
