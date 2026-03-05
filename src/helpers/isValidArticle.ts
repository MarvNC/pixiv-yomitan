import { PixivArticle } from '@prisma/client';

const filteredParentCategories = new Set(['隔離記事', '荒らし記事','自演記事', '不要記事', '白紙化', '削除記事', '立て逃げ記事', '意味のない記事']);
const dashOnlySummaryPattern = /^[ー-]+$/;
const trailingSummaryPunctuationPattern = /[。．.、,!?！？]+$/u;
const markdownDecorationPattern = /[*_`]+/gu;
const spaceLikePattern = /[\s\u3164]+/gu;
const parenthesizedSegmentPattern = /\([^()]*\)|（[^（）]*）/gu;
const endingVerbSuffixPattern =
  '(?:します|した|しました|しています|しております|してあります|されています|されました|されております|いたします|いたしました|いたしております|致します|致しました|致しております|させて(?:いただ|頂)き(?:ます|ました)|お願いします)?';
const blankingSummaryEndingPattern = new RegExp(
  `(?:白紙化${endingVerbSuffixPattern}|白紙化に${endingVerbSuffixPattern}|白紙化された記事(?:です)?|白紙化記事(?:です)?|白紙化した記事(?:です)?|白紙化による記事です|白紙化となりました|白紙化が決定しました|白紙化を行いました|白紙化がおこなわれ(?:ました|ています)|白紙化処理|白紙化済)$`,
  'u'
);
const deletionSummaryEndingPattern = new RegExp(
  `(?:削除|除去|排除)${endingVerbSuffixPattern}$`,
  'u'
);
const deletionStatusSummaryPattern =
  /(?:削除済(?:み)?(?:の記事)?(?:です)?|削除された記事(?:です)?|削除記事|削除希望|削除依頼(?:中|を提出中|を(?:運営に)?依頼中)?(?:です)?|削除待(?:ち|つ記事)|削除される可能性があります|削除を(?:運営に)?依頼中(?:です)?)$/u;
const deletionMarkerOnlySummaryPattern =
  /^(?:[・.。．、,\s　-]+)?削除(?:[・.。．、,\s　-]+)*(?:した記事|済み?)?$/u;
const abandonedArticleSummaryPattern =
  /立て逃げ記事(?:$|です$|.*(?:につき|なので|であるため|のため|かつ|により))/u;
const abandonedTrollSummaryPattern = /立て逃げ.*(?:荒らし記事|自演記事)/u;
const trollArticleSummaryEndingPattern = /(?:荒らし記事|自演記事)(?:です)?$/u;
const unwantedArticleTerminalPattern = /不要記事(?:に)?(?:です)?$/u;
const leadingUnwantedArticlePattern = /^不要記事(?:$|(?:\s|　|[。．.,、]).*)/u;
const unwantedArticleJudgementPattern = /不要記事と判断(?:します|した)/u;
const unwantedArticleApplicablePattern = new RegExp(
  `不要記事に(?:該当)?${endingVerbSuffixPattern}$`,
  'u'
);
const unusedTagSummaryPattern =
  /^※?(?:現在)?(?:使われていない|使用されていない)タグ(?:です)?$/u;
const unwantedUnusedTagSummaryPattern =
  /^不要記事(?:\s|　)+(?:使われていない|使用されていない)タグ(?:です)?$/u;
const unusedTagModerationActionPattern =
  /(?:タグとして(?:の)?使用(?:が)?ない|タグとして(?:使用|機能)されていない|タグとして機能していない|pixivのタグとして使用されておらず).*(?:削除|白紙化|不要記事|判断|使用不可)/u;
const requestedDeletionAndBlankingSummaryPattern =
  /^この記事は初版執筆者本人あるいは要請により内容を削除し、白紙化(?:しています|しております)/u;
const quoteListBloatBlankingPattern = /名言.*一覧記事の肥大化に伴い白紙化されました/u;
const parenthesizedModerationSummaryPattern =
  /^[（(].*(?:削除|白紙化|不要記事|立て逃げ|荒らし|自演).*[）)]$/u;
const whitepaperModerationNoticePattern =
  /白紙化(?:済|とさせて(?:いただ|頂)き(?:ます|ました)|[ー-])/u;
const moderationContextPattern =
  '(?:荒らし|自演|自作自演|立て逃げ|宣伝|独自研究|不適切|虚偽|誤情報|誤表記|誤記|プライバシー権|私物化|不要記事|審議|問題)';
const moderationActionPattern = '(?:削除|白紙化|撤去|排除|依頼)';
const moderationActionSummaryPattern =
  new RegExp(
    `(?:${moderationContextPattern}.*${moderationActionPattern}|${moderationActionPattern}.*${moderationContextPattern})`,
    'u'
  );
const contentDeletionSummaryPattern = /^(?:内容|記事内容|記事本文)の削除/u;
const definitionMarker = 'とは';
const invalidSummaryPatterns = [
  deletionMarkerOnlySummaryPattern,
  deletionStatusSummaryPattern,
  abandonedArticleSummaryPattern,
  abandonedTrollSummaryPattern,
  trollArticleSummaryEndingPattern,
  unwantedArticleTerminalPattern,
  leadingUnwantedArticlePattern,
  unwantedArticleJudgementPattern,
  unwantedArticleApplicablePattern,
  unusedTagSummaryPattern,
  unwantedUnusedTagSummaryPattern,
  unusedTagModerationActionPattern,
  requestedDeletionAndBlankingSummaryPattern,
  quoteListBloatBlankingPattern,
  parenthesizedModerationSummaryPattern,
  whitepaperModerationNoticePattern,
  moderationActionSummaryPattern,
  contentDeletionSummaryPattern,
  blankingSummaryEndingPattern,
  deletionSummaryEndingPattern,
  dashOnlySummaryPattern,
] as const;

function hasFilteredCategory(headers: string[]): boolean {
  return headers.some((category) => filteredParentCategories.has(category));
}

function isInvalidSummary(summary: string): boolean {
  return invalidSummaryPatterns.some((pattern) => pattern.test(summary));
}

function normalizeSummary(summary: string): string {
  return summary
    .replace(markdownDecorationPattern, '')
    .replace(spaceLikePattern, ' ')
    .trim()
    .replace(trailingSummaryPunctuationPattern, '');
}

function stripParenthesizedSegments(summary: string): string {
  let previous = summary;
  let stripped = previous.replace(parenthesizedSegmentPattern, '');
  while (stripped !== previous) {
    previous = stripped;
    stripped = previous.replace(parenthesizedSegmentPattern, '');
  }
  return stripped;
}

export function isValidArticle(article: PixivArticle): boolean {
  // Check if article is in a troll category
  const parsedHeaders: unknown = JSON.parse(article.header || '[]');
  if (!Array.isArray(parsedHeaders)) {
    throw new Error(`Invalid headers: ${article.header}`);
  }

  const headers = parsedHeaders as string[];
  if (hasFilteredCategory(headers)) {
    return false;
  }

  // Filter deleted/blanked vandalism summaries.

  // Normalize summary by trimming and removing trailing punctuation for comparison.
  const normalizedSummary = normalizeSummary(article.summary);

  // If the summary contains the definition marker 'とは', it's likely a valid article, even if it has other patterns.
  if (normalizedSummary.includes(definitionMarker)) {
    return true;
  }

  // Ignore moderation notes that appear only inside parentheses.
  const normalizedSummaryWithoutParentheses = normalizeSummary(
    stripParenthesizedSegments(normalizedSummary)
  );

  if (
    normalizedSummaryWithoutParentheses &&
    isInvalidSummary(normalizedSummaryWithoutParentheses)
  ) {
    return false;
  }

  // If nothing meaningful remains after removing parenthesized segments,
  // fall back to the original summary so pure moderation notes still get filtered.
  if (
    !normalizedSummaryWithoutParentheses &&
    isInvalidSummary(normalizedSummary)
  ) {
    return false;
  }

  return true;
}
