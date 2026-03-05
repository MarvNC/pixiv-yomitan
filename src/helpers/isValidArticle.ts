import { PixivArticle } from '@prisma/client';

const FILTERED_PARENT_CATEGORIES = new Set([
  '隔離記事',
  '荒らし記事',
  '自演記事',
  '不要記事',
  '白紙化',
  '削除記事',
  '立て逃げ記事',
  '意味のない記事',
]);

const SUMMARY_PATTERNS = {
  trailingPunctuation: /[。．.、,!?！？]+$/u,
  markdownDecoration: /[*_`]+/gu,
  spaceLike: /[\s\u3164]+/gu,
  parenthesizedSegment: /\([^()]*\)|（[^（）]*）/gu,
  definitionMarker: /とは(?:[、。．.,:\s]|$)/u,
} as const;

const VERB_SUFFIX =
  '(?:します|した|しました|しています|しております|してあります|されています|されました|されております|いたします|いたしました|いたしております|致します|致しました|致しております|させて(?:いただ|頂)き(?:ます|ました)|お願いします)?';
const MODERATION_CONTEXT =
  '(?:荒らし|自演|自作自演|立て逃げ|宣伝|独自研究|不適切|虚偽|誤情報|誤表記|誤記|プライバシー権|私物化|不要記事|審議|問題)';
const MODERATION_ACTION = '(?:削除|白紙化|撤去|排除|依頼)';

const INVALID_SUMMARY_PATTERNS: readonly RegExp[] = [
  /^[【<＜《〈].*(?:削除|白紙化|不要記事|存在していません|情報削除済|ガイドライン違反).*[】>＞》〉]/u,
  /^[＊*].*(?:削除|白紙化|存在していません).*[＊*]$/u,
  /(?:転送済み|転送記事化|白紙化.*転送|白紙化.*新規投稿|削除要請中|削除待ち)/u,
  /(?:この記事|この項目|この企画|記事(?:内容|本文)?).*(?:削除|白紙化|不要記事|利用規約|機能していない|存在していません)/u,
  /(?:ごめんなさい|申し訳ありません|ご指摘|事情により).*(?:削除|白紙化)/u,
  /(?:誤記|誤作成|誤字|作成ミス|題名ミス|タイトルに誤り|重複記事).*(?:不要記事|削除|白紙化|とする|不要記事化)/u,
  /(?:自演記事|自作自演記事|荒らし記事).*(?:処置|作ってはいけません|編集しないで下さい|白紙|削除|となっています)/u,
  /(?:規約に反する|利用規約に反して|ガイドライン違反|タグとして使えない).*(?:削除|白紙化|不要記事|記事)/u,
  /(?:タグ(?:として)?(?:が)?機能していない|タグ分類に必要).*(?:削除|白紙化|不要記事)/u,
  /^(?:削除(?:しました|完了しました|済みです|させてもらいました|したいです|待ちです).*)$/u,
  /削除[・….,。．、!?！？\s　-]+/u,
  /白紙化しようと思っています/u,
  /作者様?.*意向.*不要記事化/u,
  /(?:自演記事|自作自演記事).*(?:です|となっています|に当たる)/u,
  /自演投稿/u,
  /悪質ユーザー.*立て逃げ記事/u,
  /^(?:[・.。．、,\s　-]+)?削除(?:[・.。．、,\s　-]+)*(?:した記事|済み?)?$/u,
  /(?:削除済(?:み)?(?:の記事)?(?:です)?|削除された記事(?:です)?|削除記事(?:です)?|削除希望|削除依頼(?:中|を提出中|を(?:運営に)?依頼中)?(?:です)?|削除待(?:ち|つ記事)|削除される可能性があります|削除を(?:運営に)?依頼中(?:です)?)$/u,
  /既に削除されていた/u,
  /立て逃げ記事(?:$|です$|.*(?:につき|なので|であるため|のため|かつ|により))/u,
  /立て逃げ.*(?:荒らし記事|自演記事)/u,
  /(?:荒らし記事|自演記事)(?:です)?$/u,
  /不要記事(?:に)?(?:です)?$/u,
  /^不要記事(?:$|(?:\s|　|[。．.,、]).*)/u,
  /不要記事と判断(?:します|した)/u,
  new RegExp(`不要記事に(?:該当)?${VERB_SUFFIX}$`, 'u'),
  /^※?(?:現在)?(?:使われていない|使用されていない)タグ(?:です)?$/u,
  /^不要記事(?:\s|　)+(?:使われていない|使用されていない)タグ(?:です)?$/u,
  /(?:タグとして(?:の)?使用(?:が)?ない|タグとして(?:使用|機能)されていない|タグとして機能していない|pixivのタグとして使用されておらず).*(?:削除|白紙化|不要記事|判断|使用不可)/u,
  /(?:使われていない|使用されていない)タグ.*(?:削除|白紙化|不要記事)/u,
  /該当作品がないため白紙化/u,
  /^この記事は初版執筆者本人あるいは要請により内容を削除し、白紙化(?:しています|しております)/u,
  /名言.*一覧記事の肥大化に伴い白紙化されました/u,
  /^[（(].*(?:削除|白紙化|不要記事|立て逃げ|荒らし|自演).*[）)]$/u,
  /白紙化(?:済|とさせて(?:いただ|頂)き(?:ます|ました)|[ー-])/u,
  new RegExp(
    `(?:${MODERATION_CONTEXT}.*${MODERATION_ACTION}|${MODERATION_ACTION}.*${MODERATION_CONTEXT})`,
    'u'
  ),
  /^(?:内容|記事内容|記事本文)の削除/u,
  new RegExp(
    `(?:白紙化${VERB_SUFFIX}|白紙化に${VERB_SUFFIX}|白紙化された記事(?:です)?|白紙化記事(?:です)?|白紙化した記事(?:です)?|白紙化による記事です|白紙化となりました|白紙化が決定しました|白紙化を行いました|白紙化がおこなわれ(?:ました|ています)|白紙化処理|白紙化済)$`,
    'u'
  ),
  new RegExp(`(?:削除|除去|排除)${VERB_SUFFIX}$`, 'u'),
  /不要記事.*(?:処理|消去|消し|削\s*除)/u,
  /白紙化処理(?:を)?(?:しています|しております)?/u,
  /白紙化(?:されました|して移しました|しました(?:が)?|すれば|として編集)/u,
  /白紙化された(?:項目|人物)/u,
  /特にないので白紙化/u,
  /削除タグ/u,
  /うわなにするやめ/u,
  /^[ー-]+$/,
] as const;

const ALWAYS_CHECK_ORIGINAL_PATTERNS: readonly RegExp[] = [
  /自演投稿/u,
  /筆者は削除されました/u,
] as const;

function parseHeaders(header: string | null): string[] {
  const parsedHeaders: unknown = JSON.parse(header || '[]');
  if (!Array.isArray(parsedHeaders)) {
    throw new Error(`Invalid headers: ${header}`);
  }
  return parsedHeaders as string[];
}

function normalizeSummary(summary: string): string {
  return summary
    .replace(SUMMARY_PATTERNS.markdownDecoration, '')
    .replace(SUMMARY_PATTERNS.spaceLike, ' ')
    .trim()
    .replace(SUMMARY_PATTERNS.trailingPunctuation, '');
}

function stripParenthesizedSegments(summary: string): string {
  let stripped = summary;
  while (true) {
    const withoutParentheses = stripped.replace(
      SUMMARY_PATTERNS.parenthesizedSegment,
      ''
    );
    if (withoutParentheses === stripped) {
      return withoutParentheses;
    }
    stripped = withoutParentheses;
  }
}

function isInvalidSummary(summary: string): boolean {
  return INVALID_SUMMARY_PATTERNS.some((pattern) => pattern.test(summary));
}

export function isValidArticle(article: PixivArticle): boolean {
  const headers = parseHeaders(article.header);
  if (headers.some((category) => FILTERED_PARENT_CATEGORIES.has(category))) {
    return false;
  }

  const normalizedSummary = normalizeSummary(article.summary);
  if (SUMMARY_PATTERNS.definitionMarker.test(normalizedSummary)) {
    return true;
  }

  const normalizedSummaryWithoutParentheses = normalizeSummary(
    stripParenthesizedSegments(normalizedSummary)
  );
  const summaryToValidate =
    normalizedSummaryWithoutParentheses || normalizedSummary;
  if (isInvalidSummary(summaryToValidate)) {
    return false;
  }

  return !ALWAYS_CHECK_ORIGINAL_PATTERNS.some((pattern) =>
    pattern.test(normalizedSummary)
  );
}
