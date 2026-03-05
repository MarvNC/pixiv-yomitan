import { PixivArticle } from '@prisma/client';

const FILTERED_PARENT_CATEGORIES = new Set([
  '荒らし記事', // Vandalised articles
  '自演記事', // Self-promotional articles
  '不要記事', // Unnecessary articles
  '白紙化', // Blanked articles
  '削除記事', // Deleted articles
  '保留記事', // Articles on hold
  '虚無記事', // Void articles
  '立て逃げ記事', // Hit-and-run articles
  '意味のない記事', // Meaningless articles
]);

const PUNCTUATION_CLASSES = {
  basic: '[。．.,、]',
  trailing: '[。．.、,!?！？]',
  definitionDelimiter: '[、。．.,:\\s]',
  deleteBoundary: '[・.。．、,\\s　-]',
  deleteDecoration: '[・….,。．、!?！？\\s　-]',
} as const;

const SUMMARY_PATTERNS = {
  trailingPunctuation: new RegExp(`${PUNCTUATION_CLASSES.trailing}+$`, 'u'),
  markdownDecoration: /[*_`]+/gu,
  spaceLike: /[\s\u3164]+/gu,
  parenthesizedSegment: /\([^()]*\)|（[^（）]*）/gu,
  definitionMarker: new RegExp(
    `とは(?:${PUNCTUATION_CLASSES.definitionDelimiter}|$)`,
    'u'
  ),
} as const;

const VERB_SUFFIX_CLASSES = {
  direct: '(?:します|した|しました|しています|しております|してあります)',
  passive: '(?:されています|されました|されております)',
  humble:
    '(?:いたします|いたしました|いたしております|致します|致しました|致しております)',
  benefactive: 'させて(?:いただ|頂)き(?:ます|ました)',
  request: 'お願いします',
} as const;

const PATTERN_CLASSES = {
  verbSuffix:
    `(?:${VERB_SUFFIX_CLASSES.direct}|${VERB_SUFFIX_CLASSES.passive}|${VERB_SUFFIX_CLASSES.humble}|${VERB_SUFFIX_CLASSES.benefactive}|${VERB_SUFFIX_CLASSES.request})?`,
  moderationContext:
    '(?:自演|自作自演|宣伝|独自研究|不適切|虚偽|誤情報|プライバシー権|私物化|不要記事|審議|問題)',
  moderationAction: '(?:削除|白紙化|撤去)',
  articleSubject:
    '(?:この記事|この項目|この企画|記事(?:内容|本文)?|本記事|当記事)',
  referentialArticleSubject: '(?:この記事|本記事|当記事)',
  unusedTag: '(?:使われていない|使用されていない)タグ',
  tagNotFunctional: '(?:タグ(?:として)?(?:が)?機能していない|タグ分類に必要)',
  deleteStatusKeywords:
    '(?:削除希望|削除待(?:ち|つ記事)|削除された記事(?:です)?|削除記事です)',
} as const;

const INVALID_SUMMARY_PATTERNS: readonly RegExp[] = [
  /^[【<＜《〈].*(?:削除|白紙化|不要記事|存在していません|情報削除済|ガイドライン違反).*[】>＞》〉]/u,
  /^[＊*].*(?:削除|白紙化|存在していません).*[＊*]$/u,
  new RegExp(
    `(?:転送済み|転送記事化(?:${PUNCTUATION_CLASSES.basic}|$)|白紙化.*転送|白紙化.*新規投稿|削除要請中|削除待ち)`,
    'u'
  ),
  new RegExp(
    `^${PATTERN_CLASSES.articleSubject}.*(?:削除|白紙化|不要記事|利用規約|機能していない|存在していません)`,
    'u'
  ),
  /(?:ごめんなさい|申し訳ありません|ご指摘|事情により).*(?:削除|白紙化)/u,
  /^(?:誤記|誤作成|誤字|作成ミス|題名ミス|タイトルに誤り|重複記事).*(?:不要記事|削除|白紙化|とする|不要記事化)/u,
  /(?:自演記事|自作自演記事|荒らし記事).*(?:処置|作ってはいけません|編集しないで下さい|白紙|削除|となっています)/u,
  /(?:規約に反する|利用規約に反して|ガイドライン違反|タグとして使えない).*(?:削除|白紙化|不要記事|不要記事化)/u,
  new RegExp(`${PATTERN_CLASSES.tagNotFunctional}.*(?:削除|白紙化|不要記事)`, 'u'),
  /^(?:削除(?:しました|完了しました|済みです|させてもらいました|したいです|待ちです).*)$/u,
  new RegExp(
    `削除(?:${PUNCTUATION_CLASSES.deleteDecoration}{2,}|${PUNCTUATION_CLASSES.deleteDecoration}+$)`,
    'u'
  ),
  /白紙化しようと思っています/u,
  /作者様?.*意向.*不要記事化/u,
  /(?:自演記事|自作自演記事).*(?:です|となっています|に当たる)/u,
  /^(?:本記事|この記事|当記事).*(?:悪質ユーザー).*(?:立て逃げ記事)/u,
  new RegExp(
    `^(?:${PUNCTUATION_CLASSES.deleteBoundary}+)?削除(?:${PUNCTUATION_CLASSES.deleteBoundary}+)*(?:した記事|済み?)?$`,
    'u'
  ),
  new RegExp(PATTERN_CLASSES.deleteStatusKeywords, 'u'),
  new RegExp(
    `${PATTERN_CLASSES.referentialArticleSubject}.*(?:削除依頼中|削除依頼)`,
    'u'
  ),
  /※この記事は削除されました※/u,
  /[《〈<]削除[》〉>]/u,
  /^(?:削除済(?:み)?(?:の記事)?(?:です)?|削除された記事(?:です)?|削除記事(?:です)?|削除希望|削除依頼(?:中|を提出中|を(?:運営に)?依頼中)?(?:です)?|削除待(?:ち|つ記事)|削除される可能性があります|削除を(?:運営に)?依頼中(?:です)?)$/u,
  /既に削除されていた/u,
  /乱立立て逃げ記事/u,
  /^(?:※)?立て逃げ記事(?:$|です$|.*(?:につき|なので|であるため|のため|かつ|により))/u,
  /立て逃げ.*(?:荒らし記事|自演記事)/u,
  /(?:荒らし記事|自演記事)(?:です)?$/u,
  /不要記事(?:に)?(?:です)?$/u,
  new RegExp(
    `^不要記事(?:$|(?:\\s|　|${PUNCTUATION_CLASSES.basic}).*)`,
    'u'
  ),
  /不要記事と判断(?:します|した|しました)/u,
  new RegExp(`不要記事に(?:該当)?${PATTERN_CLASSES.verbSuffix}$`, 'u'),
  new RegExp(`^※?(?:現在)?${PATTERN_CLASSES.unusedTag}(?:です)?$`, 'u'),
  new RegExp(`^不要記事(?:\\s|　)+${PATTERN_CLASSES.unusedTag}(?:です)?$`, 'u'),
  /(?:タグとして(?:の)?使用(?:が)?ない|タグとして(?:使用|機能)されていない|タグとして機能していない|pixivのタグとして使用されておらず).*(?:削除|白紙化|不要記事|判断|使用不可)/u,
  new RegExp(`${PATTERN_CLASSES.unusedTag}.*(?:削除|白紙化|不要記事)`, 'u'),
  /該当作品がないため白紙化/u,
  /^この記事は初版執筆者本人あるいは要請により内容を削除し、白紙化(?:しています|しております)/u,
  /名言.*一覧記事の肥大化に伴い白紙化されました/u,
  /^[（(].*(?:削除|白紙化|不要記事|立て逃げ|荒らし|自演).*[）)]$/u,
  /白紙化(?:済|とさせて(?:いただ|頂)き(?:ます|ました)|[ー-])/u,
  new RegExp(
    `(?:${PATTERN_CLASSES.moderationContext}.*${PATTERN_CLASSES.moderationAction}|${PATTERN_CLASSES.moderationAction}.*${PATTERN_CLASSES.moderationContext})`,
    'u'
  ),
  /^(?:内容|記事内容|記事本文)の削除/u,
  new RegExp(
    `(?:白紙化${PATTERN_CLASSES.verbSuffix}|白紙化に${PATTERN_CLASSES.verbSuffix}|白紙化された記事(?:です)?|白紙化記事(?:です)?|白紙化した記事(?:です)?|白紙化による記事です|白紙化となりました|白紙化が決定しました|白紙化を行いました|白紙化がおこなわれ(?:ました|ています)|白紙化処理|白紙化済)$`,
    'u'
  ),
  new RegExp(`(?:削除|除去|排除)${PATTERN_CLASSES.verbSuffix}$`, 'u'),
  /不要記事.*(?:処理|消去|消し|削\s*除)/u,
  /機能していない記事のため削除/u,
  /白紙化(?:処理(?:を)?(?:しています|しております)?|した本人|された(?:項目|人物)|されました|して移しました|しました(?:が)?|すれば|として編集)/u,
  /特にないので白紙化/u,
  /削除タグ/u,
  /うわなにするやめ/u,
  /^[ー-]+$/,
] as const;

const ALWAYS_CHECK_ORIGINAL_PATTERNS: readonly RegExp[] = [
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

function matchesAnyPattern(
  summary: string,
  patterns: readonly RegExp[]
): boolean {
  return patterns.some((pattern) => pattern.test(summary));
}

function hasFilteredParentCategory(headers: string[], tagName: string): boolean {
  const lastHeaderIndex = headers.length - 1;
  return headers.some((category, index) => {
    if (!FILTERED_PARENT_CATEGORIES.has(category)) {
      return false;
    }
    const isSelfTerminalHeader =
      index === lastHeaderIndex && category === tagName;
    return !isSelfTerminalHeader;
  });
}

export function isValidArticle(article: PixivArticle): boolean {
  const headers = parseHeaders(article.header);
  if (hasFilteredParentCategory(headers, article.tag_name)) {
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

  if (matchesAnyPattern(summaryToValidate, INVALID_SUMMARY_PATTERNS)) {
    return false;
  }

  return !matchesAnyPattern(normalizedSummary, ALWAYS_CHECK_ORIGINAL_PATTERNS);
}
