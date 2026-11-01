import crypto from "node:crypto";
import { VhlTeamNameNormalizer } from "./VhlTeamNameNormalizer.js";
import { VhlTeamSimilarityCalculator } from "./VhlTeamSimilarityCalculator.js";

export class VhlMatchReviewPolicy {
  constructor(normalizer = new VhlTeamNameNormalizer(), similarity = new VhlTeamSimilarityCalculator()) {
    Object.assign(this, { normalizer, similarity });
  }
  createProposal(match, source) {
    if (!match?.id || !/^\d+$/.test(String(match.onlineGameId)) || !source) return null;
    if (String(source.gameId) !== String(match.onlineGameId)) return null;
    if (!Number.isFinite(Date.parse(match.startsAt)) || source.scheduledAt?.slice(0, 10) !== match.startsAt.slice(0, 10)) return null;
    const key = (value) => this.normalizer.createComparisonKey(value);
    const own = key("Горняк-УГМК");
    const home = key(match.homeTeam) === own; const away = key(match.awayTeam) === own;
    if (home === away || key(home ? source.homeTeam : source.awayTeam) !== own) return null;
    const expectedName = home ? match.awayTeam : match.homeTeam;
    const sourceName = home ? source.awayTeam : source.homeTeam;
    if (![expectedName, sourceName].every((name) => typeof name === "string" && name.trim() && name.length <= 120)) return null;
    if (key(sourceName) === own || key(expectedName) === key(sourceName)) return null;
    const expected = { id: match.id, onlineGameId: String(match.onlineGameId), homeTeam: match.homeTeam,
      awayTeam: match.awayTeam, startsAt: match.startsAt };
    const actual = { gameId: String(source.gameId), homeTeam: source.homeTeam, awayTeam: source.awayTeam, scheduledAt: source.scheduledAt.slice(0, 10) };
    const id = crypto.createHash("sha256").update(JSON.stringify({ expected, actual })).digest("hex").slice(0, 24);
    return { id, expected, actual, expectedName, sourceName, similarity: this.similarity.calculateSimilarity(expectedName, sourceName) };
  }
  matchesCalendar(review, match) {
    return ["id", "onlineGameId", "homeTeam", "awayTeam", "startsAt"].every((field) => String(review.expected[field]) === String(match[field]));
  }
}
