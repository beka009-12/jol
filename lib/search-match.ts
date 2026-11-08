const STOP_WORDS = new Set([
  "в",
  "во",
  "на",
  "у",
  "по",
  "и",
  "с",
  "для",
  "где",
  "как",
  "что",
  "the",
  "in",
  "at",
  "a",
  "an",
  "to",
  "of",
  "and",
  "for",
  "near",
]);

function words(text: string): string[] {
  return text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
}

// Russian and English inflect the end of a word, so "Караколе" should find "Каракол".
function stem(word: string): string {
  if (word.length <= 3) return word.slice(0, 2);
  return word.slice(0, Math.max(3, word.length - 2));
}

/** True when every meaningful word of the query starts a word in the fields. */
export function matchesQuery(query: string, fields: string[]): boolean {
  const terms = words(query).filter((word) => !STOP_WORDS.has(word));
  if (terms.length === 0) return true;

  const haystack = fields.flatMap(words);
  return terms.every((term) => {
    const prefix = stem(term);
    return haystack.some((word) => word.startsWith(prefix));
  });
}
