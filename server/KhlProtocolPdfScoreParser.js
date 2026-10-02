import { HockeyMatchDecisionResolver } from "./HockeyMatchDecisionResolver.js";
import { KhlProtocolScoreItemReader } from "./KhlProtocolScoreItemReader.js";

export class KhlProtocolPdfScoreParser {
  constructor(decisionResolver = new HockeyMatchDecisionResolver(), itemReader = new KhlProtocolScoreItemReader()) {
    Object.assign(this, { decisionResolver, itemReader });
  }

  parseFinalScore(lines, pages = []) {
    const [homeGoals, awayGoals] = this.itemReader.readScore(pages) || this.#readScoreFromLines(lines) || [];
    if (!Number.isFinite(homeGoals) || !Number.isFinite(awayGoals)) return null;
    return { homeGoals, awayGoals, decidedBy: this.decisionResolver.resolveFromProtocolText(lines.join("\n")) };
  }

  #readScoreFromLines(lines) {
    const startIndex = lines.findIndex((line) => line.includes("Начало матча:"));
    if (startIndex < 0) return null;
    const inlineScore = lines[startIndex].match(/^(\d+)\s+Начало матча:.*?\s(\d+)$/);
    if (inlineScore) return inlineScore.slice(1).map(Number);
    const scoreLine = lines.slice(startIndex + 1, startIndex + 5).find((line) => /^\d+\s+\d+$/.test(line));
    return scoreLine ? scoreLine.split(/\s+/).map(Number) : null;
  }
}
