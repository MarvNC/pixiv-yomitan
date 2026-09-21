import { describe, expect, it } from 'bun:test';
import type { PixivArticle } from '@prisma/client';
import type { StructuredContentNode } from 'yomichan-dict-builder/dist/types/yomitan/termbank';

import { addMainText } from './addMainText';

function createArticle(mainText: string | null): PixivArticle {
  return {
    tag_name: 'test-tag',
    summary: '',
    updated_at: '',
    main_illst_url: '',
    view_count: 0,
    illust_count: 0,
    check_count: 0,
    related_tags: '[]',
    parent: null,
    lastScraped: '',
    reading: null,
    header: null,
    mainText,
    lastScrapedReading: null,
    lastScrapedArticle: null,
  };
}

function getRenderedMainText(mainText: string | null): StructuredContentNode[] {
  const content: StructuredContentNode[] = [];
  addMainText(createArticle(mainText), content);
  return content;
}

describe('addMainText', () => {
  it('removes only leading line breaks from historical scrape results', () => {
    const content = getRenderedMainText('\r\n\n本文\n\n次の段落');

    expect(content[1]).toEqual({
      tag: 'ul',
      content: [{ tag: 'li', content: '本文\n\n次の段落' }],
      data: { pixiv: 'main-text' },
      style: { listStyleType: 'none' },
    });
  });

  it('preserves leading spaces, tabs, and internal line breaks', () => {
    const mainText = ' \t本文\n\n次の段落';
    const content = getRenderedMainText(mainText);

    expect(content[1]).toMatchObject({
      content: [{ tag: 'li', content: mainText }],
    });
  });

  it('does not add an empty section for content containing only line breaks', () => {
    expect(getRenderedMainText('\r\n\n')).toEqual([]);
  });
});
