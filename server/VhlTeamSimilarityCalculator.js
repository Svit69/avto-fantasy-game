import { VhlTeamNameNormalizer } from "./VhlTeamNameNormalizer.js";

export class VhlTeamSimilarityCalculator {
  constructor(normalizer = new VhlTeamNameNormalizer()) { this.normalizer = normalizer; }
  calculateSimilarity(left, right) {
    const clean = (name) => this.normalizer.createComparisonKey(name).replace(/[^\p{L}\p{N}]+/gu, " ").trim();
    const a = clean(left); const b = clean(right);
    if (!a || !b || a.length > 120 || b.length > 120) return 0;
    let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
    for (let i = 1; i <= a.length; i += 1) {
      const current = [i];
      for (let j = 1; j <= b.length; j += 1) {
        current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      previous = current;
    }
    const editSimilarity = 1 - previous[b.length] / Math.max(a.length, b.length);
    const tokens = a.split(" "); const other = b.split(" ");
    const common = tokens.filter((token) => token.length >= 4 && other.includes(token)).length;
    return Math.round(Math.max(editSimilarity, common ? common / Math.max(tokens.length, other.length) : 0) * 100);
  }
}
