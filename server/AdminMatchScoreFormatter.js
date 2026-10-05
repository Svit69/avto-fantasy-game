export class AdminMatchScoreFormatter {
  format(score = {}) {
    if (!Number.isFinite(score.homeGoals) || !Number.isFinite(score.awayGoals)) return "Счет: не распознан";
    return `Счет: ${this.formatInline(score)}`;
  }

  formatInline(score) {
    const suffix = { overtime: " ОТ", shootout: " Б" }[score.decidedBy] || "";
    return `${score.homeGoals}:${score.awayGoals}${suffix}`;
  }
}
