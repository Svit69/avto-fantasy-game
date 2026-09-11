export class KhlProtocolPdfScoreParser {
  parseFinalScore(lines) {
    const startIndex = lines.findIndex((line) => line.startsWith("Начало матча:"));
    const scoreLine = lines.slice(startIndex + 1).find((line) => /^\d+\s+\d+$/.test(line));
    const [homeGoals, awayGoals] = String(scoreLine || "").split(/\s+/).map(Number);
    return Number.isFinite(homeGoals) && Number.isFinite(awayGoals) ? { homeGoals, awayGoals } : null;
  }
}
