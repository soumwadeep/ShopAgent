const promotional = /\b(now tastier|made with|kitchen ingredients?|only|per serve|energy|adult|kcal|namkeen)\b/i;

export function ocrQuery(text: string): string {
  const seen = new Set<string>();
  const candidates = text.split(/\r?\n/).flatMap((raw, index) => {
    const line = raw.replace(/[^\p{L}\p{N}\s-]/gu, " ").replace(/\s+/g, " ").trim();
    const key = line.toLowerCase();
    const words = line.split(" ").filter(Boolean);
    if (line.length < 3 || line.length > 55 || promotional.test(line) || seen.has(key)) return [];
    seen.add(key);
    const shortWords = words.filter(word => word.length < 3).length;
    const score = (words.length <= 3 ? 3 : 0) + (words.every(word => word.length >= 3) ? 2 : 0) + (/\d/.test(line) ? 2 : 0) - shortWords * 2;
    return score >= 3 ? [{ line, index, score }] : [];
  });
  return candidates.sort((a, b) => b.score - a.score || a.index - b.index).slice(0, 2).sort((a, b) => a.index - b.index).map(item => item.line).join(" ").slice(0, 120);
}
