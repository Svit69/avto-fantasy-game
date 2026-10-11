export class PlayerPriceRecommendationFormatter {
  formatRecommendation(item) {
    const player = item.player;
    const averages = item.summaries.map((summary) => `${summary.tour.title}: ${summary.count ? `${summary.mean.toFixed(1)} ФО, матчей: ${summary.count}` : "нет сыгранных матчей"}`);
    const stability = item.variability <= 0.35 ? "высокая" : item.variability <= 0.7 ? "средняя" : "низкая";
    const advantage = Math.round((item.forecast / player.price / item.benchmark - 1) * 100);
    return [`${player.lastName} ${player.firstName} · ${player.team} · ${player.position}`,
      `Цена: ${player.price}к → ${item.suggestedPrice}к (${item.suggestedPrice > player.price ? "повысить" : "снизить"})`,
      ...averages, `Оценка формы: ${item.forecast.toFixed(1)} ФО/матч. Стабильность: ${stability}.`,
      `Отдача на 1к: ${advantage > 0 ? "+" : ""}${advantage}% к медиане игроков той же команды и позиции.`].join("\n");
  }
}
