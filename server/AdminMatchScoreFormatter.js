export class AdminMatchScoreFormatter {
  format(score = {}) {
    if (!Number.isFinite(score.homeGoals) || !Number.isFinite(score.awayGoals)) return "Счет: не распознан";
    const suffix = { overtime: " ОТ", shootout: " Б" }[score.decidedBy] || "";
    return `Счет: ${score.homeGoals}:${score.awayGoals}${suffix}`;
  }
}
