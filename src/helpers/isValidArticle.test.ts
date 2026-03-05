import { describe, expect, it } from 'bun:test';
import type { PixivArticle } from '@prisma/client';

import { isValidArticle } from './isValidArticle';

function createArticle(overrides: Partial<PixivArticle> = {}): PixivArticle {
  return {
    tag_name: 'test-tag',
    summary: '正常な記事の概要',
    updated_at: '2026-01-01 00:00:00',
    main_illst_url: 'https://example.com/image.png',
    view_count: 1,
    illust_count: 1,
    check_count: 1,
    related_tags: '[]',
    parent: null,
    lastScraped: '2026-01-01 00:00:00',
    reading: null,
    header: '[]',
    mainText: null,
    lastScrapedReading: null,
    lastScrapedArticle: null,
    ...overrides,
  };
}

function expectSummaryToBeInvalid(summary: string): void {
  const article = createArticle({ summary });
  expect(isValidArticle(article)).toBe(false);
}

function expectSummaryToBeValid(summary: string): void {
  const article = createArticle({ summary });
  expect(isValidArticle(article)).toBe(true);
}

describe('isValidArticle', () => {
  describe('valid articles', () => {
    it('returns true for a normal article', () => {
      const article = createArticle();
      expect(isValidArticle(article)).toBe(true);
    });

    it('returns true when troll category is only the last header item', () => {
      const article = createArticle({
        header: JSON.stringify(['カテゴリ', '荒らし記事']),
      });
      expect(isValidArticle(article)).toBe(true);
    });

    it('returns true when filtered category is only the last header item', () => {
      const article = createArticle({
        header: JSON.stringify(['カテゴリ', '不要記事']),
      });
      expect(isValidArticle(article)).toBe(true);
    });

    it('returns true for summaries containing non-dash text', () => {
      expectSummaryToBeValid('ーーー更新あり');
    });

    it('keeps explanatory text that starts with 削除 as a term name', () => {
      expectSummaryToBeValid('削除番長、ニコニコ動画にて二番目に古い動画。');
    });

    it('keeps summary: 削除記事とは、不要記事・荒らし記事の成れの果て。', () => {
      expectSummaryToBeValid('削除記事とは、不要記事・荒らし記事の成れの果て。');
    });

    it('keeps summary: ここでは主にピクシブ百科事典で不要記事とされがちな種類の記事について説明する。', () => {
      expectSummaryToBeValid(
        'ここでは主にピクシブ百科事典で不要記事とされがちな種類の記事について説明する。'
      );
    });

    it('keeps summaries containing とは automatically', () => {
      expectSummaryToBeValid('削除とは、不要記事につき削除');
    });

  });

  describe('invalid articles', () => {
    it('returns false when parent categories include a troll category', () => {
      const article = createArticle({
        header: JSON.stringify(['カテゴリ', '荒らし記事', '末端カテゴリ']),
      });
      expect(isValidArticle(article)).toBe(false);
    });

    it('returns false when parent categories include 不要記事', () => {
      const article = createArticle({
        header: JSON.stringify(['カテゴリ', '不要記事', '末端カテゴリ']),
      });
      expect(isValidArticle(article)).toBe(false);
    });

    it('returns false for standalone 立て逃げ記事 summary', () => {
      expectSummaryToBeInvalid('立て逃げ記事');
    });

    it('returns false for 立て逃げ記事 summary with moderation note', () => {
      expectSummaryToBeInvalid(
        '※立て逃げ記事。執筆依頼提出中につき、正しい記事内容を作成できる方は記事の執筆をお願い致します。'
      );
    });

    it('deletes summary: 立て逃げ記事につき、編集待ち。', () => {
      expectSummaryToBeInvalid('立て逃げ記事につき、編集待ち。');
    });

    it('deletes summary: 立て逃げ記事につき撤去。', () => {
      expectSummaryToBeInvalid('立て逃げ記事につき撤去。');
    });

    it('deletes summary: 立て逃げ記事により、編集待ち。', () => {
      expectSummaryToBeInvalid('立て逃げ記事により、編集待ち。');
    });

    it('deletes summary: 立て逃げ記事かつ長期にわたっての管理が困難なため白紙化されました。', () => {
      expectSummaryToBeInvalid('立て逃げ記事かつ長期にわたっての管理が困難なため白紙化されました。');
    });

    it('returns false for invalid summary fragments with trailing 。', () => {
      expectSummaryToBeInvalid('削除しました。。。');
    });

    it('returns false for dash-only summaries after trim', () => {
      expectSummaryToBeInvalid('  ーーー  ');
    });

    it('deletes summaries ending with standalone 白紙化', () => {
      expectSummaryToBeInvalid('自演記事です。白紙化。');
    });

    it('deletes summary: 著作権侵害につき削除。', () => {
      expectSummaryToBeInvalid('著作権侵害につき削除。');
    });

    it('deletes summary: 意味を成さない記事なので除去', () => {
      expectSummaryToBeInvalid('意味を成さない記事なので除去');
    });

    it('deletes summary: ※現在使われていないタグです。', () => {
      expectSummaryToBeInvalid('※現在使われていないタグです。');
    });

    it('deletes summary: 不要記事につき、削除します。', () => {
      expectSummaryToBeInvalid('不要記事につき、削除します。');
    });

    it('deletes summary: 荒し記事である為削除', () => {
      expectSummaryToBeInvalid('荒し記事である為削除');
    });

    it('deletes summary: 自演記事につき白紙化', () => {
      expectSummaryToBeInvalid('自演記事につき白紙化');
    });

    it('deletes summary: 名前を間違えたため白紙化', () => {
      expectSummaryToBeInvalid('名前を間違えたため白紙化');
    });

    it('deletes summary: 白紙化された記事です', () => {
      expectSummaryToBeInvalid('白紙化された記事です');
    });

    it('deletes summary: 不要記事につき白紙化しました。', () => {
      expectSummaryToBeInvalid('不要記事につき白紙化しました。');
    });

    it('deletes summary: 誤記です。不要記事。、、', () => {
      expectSummaryToBeInvalid('誤記です。不要記事。、、');
    });

    it('deletes summary: 誤記。不要記事に、、', () => {
      expectSummaryToBeInvalid('誤記。不要記事に、、');
    });

    it('deletes summary: タイトルミスのため不要記事に該当します。', () => {
      expectSummaryToBeInvalid('タイトルミスのため不要記事に該当します。');
    });

    it('deletes summary: pixiv百科事典のガイドラインに違反してると判断したため、不要記事にさせていただきます。', () => {
      expectSummaryToBeInvalid(
        'pixiv百科事典のガイドラインに違反してると判断したため、不要記事にさせていただきます。'
      );
    });

    it('deletes summary: この記事は白紙化しました。', () => {
      expectSummaryToBeInvalid('この記事は白紙化しました。');
    });

    it('deletes summary: ただの自己紹介の為白紙化', () => {
      expectSummaryToBeInvalid('ただの自己紹介の為白紙化');
    });

    it('deletes summary: 自演のため白紙化しました。', () => {
      expectSummaryToBeInvalid('自演のため白紙化しました。');
    });

    it('deletes summary: 情報がない記事のため白紙化。', () => {
      expectSummaryToBeInvalid('情報がない記事のため白紙化。');
    });

    it('deletes summary: 自演記事なので白紙化しました。', () => {
      expectSummaryToBeInvalid('自演記事なので白紙化しました。');
    });

    it('deletes summary: 内容のない記事であるため白紙化。', () => {
      expectSummaryToBeInvalid('内容のない記事であるため白紙化。');
    });

    it('deletes summary: 規約違反記事のため白紙化しました。', () => {
      expectSummaryToBeInvalid('規約違反記事のため白紙化しました。');
    });

    it('deletes summary: 記事作成ミスのため白紙化。', () => {
      expectSummaryToBeInvalid('記事作成ミスのため白紙化。');
    });

    it('deletes summary: タグとしての使用例が無いため白紙化', () => {
      expectSummaryToBeInvalid('タグとしての使用例が無いため白紙化');
    });

    it('deletes summary: 削除申請済みですが不安なので白紙化しています', () => {
      expectSummaryToBeInvalid('削除申請済みですが不安なので白紙化しています');
    });

    it('deletes summary: 誤って作成した記事であるため白紙化致しました', () => {
      expectSummaryToBeInvalid('誤って作成した記事であるため白紙化致しました');
    });
  });
});
