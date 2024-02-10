import { normalizeReading } from "japanese-furigana-normalize";

const term = "喫茶ステラと死神の蝶"; // Kanji term
const reading = "かふぇすてらとしにがみのちょう"; // Hiragana reading
const normalizedReading = normalizeReading(term, reading);
console.log(normalizedReading); // Output: かふぇステラとしにがみのちょう
