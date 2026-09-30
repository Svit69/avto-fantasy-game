import { HockeyMatchDecisionResolver } from "./HockeyMatchDecisionResolver.js";

export class KhlProtocolPdfScoreParser {
  constructor(decisionResolver = new HockeyMatchDecisionResolver()) { this.decisionResolver = decisionResolver; }

  parseFinalScore(lines) {
    const startIndex = lines.findIndex((line) => line.startsWith("Начало матча:"));
    const scoreLine = lines.slice(startIndex + 1).find((line) => /^\d+\s+\d+$/.test(line));
    const [homeGoals, awayGoals] = String(scoreLine || "").split(/\s+/).map(Number);
    if (!Number.isFinite(homeGoals) || !Number.isFinite(awayGoals)) return null;
    return { homeGoals, awayGoals, decidedBy: this.decisionResolver.resolveFromProtocolText(lines.join("\n")) };
  }
}
