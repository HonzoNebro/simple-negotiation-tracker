export function normalizeSearchText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase()
    .trim();
}

export function fuzzyScore(query, text) {
  const needle = normalizeSearchText(query);
  const haystack = normalizeSearchText(text);
  if (!needle) return 0;
  if (!haystack) return -1;
  if (haystack === needle) return 1000;
  if (haystack.startsWith(needle)) return 800 - haystack.length;
  if (haystack.includes(needle)) return 600 - haystack.indexOf(needle);

  let score = 0;
  let searchIndex = 0;
  let streak = 0;

  for (const character of needle) {
    const foundIndex = haystack.indexOf(character, searchIndex);
    if (foundIndex === -1) return -1;
    streak = foundIndex === searchIndex ? streak + 1 : 0;
    score += 10 + streak - (foundIndex - searchIndex);
    searchIndex = foundIndex + 1;
  }

  return score - haystack.length;
}

export function filterSearchResults(entries, query, { limit = 30, nameKey = "name" } = {}) {
  const source = Array.isArray(entries) ? entries : [];
  const needle = normalizeSearchText(query);
  if (!needle) return source.slice(0, limit);

  return source
    .map((entry, index) => ({
      entry,
      index,
      score: fuzzyScore(needle, entry?.[nameKey]),
    }))
    .filter((result) => result.score >= 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((result) => result.entry);
}
