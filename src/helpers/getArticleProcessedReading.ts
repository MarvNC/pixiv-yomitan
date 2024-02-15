import { normalizeReading } from 'japanese-furigana-normalize';

export function getArticleProcessedReading(
  term: string,
  reading: string | null,
): string {
  if (!reading) {
    return '';
  }
  // ー is a common placeholder for missing readings
  if (reading === 'ー') {
    return '';
  }
  const normalizedReading = normalizeReading(term, reading);
  return normalizedReading;
}
