/**
 * Parses Flashscore's raw text feed into an array of objects.
 * The feed usually separates blocks by `~` and key-values by `÷`, with properties separated by `¬` or simply all connected with `¬` and `÷`.
 * Format: ~ZA÷League Name¬...~AA÷Home Team¬AB÷Away Team¬AD÷Time¬AE÷MatchId¬...
 */
export function parseFlashscoreFeed(text: string): Record<string, string>[] {
  if (!text) return [];

  const results: Record<string, string>[] = [];
  const blocks = text.split('~');

  for (const block of blocks) {
    if (!block.trim()) continue;

    const properties = block.split('¬');
    const obj: Record<string, string> = {};

    for (const prop of properties) {
      const parts = prop.split('÷');
      if (parts.length >= 2) {
        const key = parts[0];
        const value = parts.slice(1).join('÷');
        obj[key] = value;
      }
    }

    if (Object.keys(obj).length > 0) {
      results.push(obj);
    }
  }

  return results;
}
