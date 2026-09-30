export class HockeyMatchScoreFormatter {
  format({ homeScore, awayScore, decidedBy }) {
    if (homeScore == null || awayScore == null) return "счёт уточняется";
    const suffix = { overtime: "ОТ", shootout: "Б" }[decidedBy] || "";
    return `${homeScore} - ${awayScore}${suffix ? ` ${suffix}` : ""}`;
  }
}
