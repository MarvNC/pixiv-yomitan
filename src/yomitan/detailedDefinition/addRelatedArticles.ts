import { PixivArticle } from '@prisma/client';
import { StructuredContentNode } from 'yomichan-dict-builder/dist/types/yomitan/termbank';
import { createUlElement } from '../createUlElement';

export function addRelatedArticles(
  article: PixivArticle,
  scList: StructuredContentNode[]
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
        '・'
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
        style: {
          listStyleType: 'none',
        },
      })
    );
  }
}
