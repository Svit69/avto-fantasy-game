export class PlayerPriceDecisionFormatter {
  describeDecision(performance, direction, recentRatio, fairPrice) {
    if (direction < 0) return recentRatio > 0.9 && fairPrice < performance.player.price * 0.75
      ? "Цена превышает бюджетный ориентир" : "Отдача ниже сопоставимых игроков";
    if (performance.recentForm?.strongGames >= 2) return "Две сильные игры подтверждают рост формы";
    return performance.recentForm?.signal === "consistent" ? "Стабильная отдача выше ценового ориентира" : "Отдача на 1к выше ценового ориентира";
  }
}
