import { PixivArticle } from '@prisma/client';
import { StructuredContentNode } from 'yomichan-dict-builder/dist/types/yomitan/termbank';
import { createUlElement } from '../createUlElement';

export function addRelatedArticles(
  article: PixivArticle,
  scList: StructuredContentNode[],
) {
  const related: string[] = JSON.parse(article.related_tags);
  if (!Array.isArray(related)) {
    throw new Error('related_tags should be an array');
  }
  if (related.length <= 0) {
    return;
  }
  scList.push({
    tag: 'div',
    data: { pixiv: 'related-tags' },
    style: {
      marginBottom: '0.4em',
    },
    content: [
      {
        tag: 'div',
        content: '関連記事',
        style: {
          fontWeight: 'bold',
        },
      },
      {
        tag: 'ul',
        content: {
          tag: 'div',
          // Map related to arr of links separated by '・'
          content: related
            .reduce((acc, tag) => {
              acc.push(
                {
                  tag: 'a',
                  href: `?query=${tag}`,
                  content: tag,
                },
                '・',
              );
              return acc;
            }, [] as StructuredContentNode[])
            // Remove last '・'
            .slice(0, -1),
        },
        data: { pixiv: 'related-tags' },
        style: {
          listStyleType: 'none',
        },
      },
    ],
  });
}
