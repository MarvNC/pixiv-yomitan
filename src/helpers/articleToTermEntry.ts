import { PixivArticle } from '@prisma/client';
import { TermEntry } from 'yomichan-dict-builder';
import { getArticleProcessedReading } from './getArticleProcessedReading';
import {
  DetailedDefinition,
  StructuredContentNode,
} from 'yomichan-dict-builder/dist/types/yomitan/termbank';

export function articleToTermEntry(article: PixivArticle): TermEntry {
  const entry = new TermEntry(article.tag_name);
  entry.setReading(getArticleProcessedReading(article));
  entry.addDetailedDefinition(createDetailedDefinition(article));
  return entry;
}

const viewsLabel = '閲覧数';
const illustrationCountLabel = '作品数';
const parentArticleSymbol = '⬆️';
function createDetailedDefinition(article: PixivArticle): DetailedDefinition {
  const scList: StructuredContentNode = [];
  if (article.parent) {
    scList.push(
      createUlElement({
        content: {
          tag: 'a',
          content: article.parent,
          href: `?query=${article.parent}&wildcards=off`,
        },
        listPrefix: parentArticleSymbol,
      }),
    );
  }
  scList.push(createUlElement({ content: article.summary }));
  // scList.push({
  //   tag: 'span',
  //   content: `${viewsLabel}${article.view_count} ${illustrationCountLabel}${article.illust_count}`,
  // });
  return {
    type: 'structured-content',
    content: scList,
  };
}

function createUlElement({
  content,
  listPrefix,
}: {
  content: StructuredContentNode;
  listPrefix?: string;
}): StructuredContentNode {
  const element: StructuredContentNode = {
    tag: 'ul',
    content: {
      tag: 'li',
      content,
    },
  };
  if (listPrefix) {
    element.style = {
      listStyleType: `"${listPrefix}"`,
    };
  }
  return element;
}
