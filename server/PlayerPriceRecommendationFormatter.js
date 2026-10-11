export class PlayerPriceRecommendationFormatter {
  formatRecommendation(item) {
    const player = item.player;
    const averages = item.summaries.map((summary) => `${summary.title}: ${summary.count ? `${summary.mean.toFixed(1)} ФО/матч, матчей: ${summary.count}` : "нет сыгранных матчей"}`);
    const stability = item.variability <= 0.35 ? "высокая" : item.variability <= 0.7 ? "средняя" : "низкая";
    const advantage = Math.round((item.forecast / player.price / item.benchmark - 1) * 100);
    const form = item.recentForm;
    const signal = { consistent: "стабильно приносит очки", two_game_surge: "всплеск за 2 игры", one_game_surge: "всплеск за 1 игру", regular: "без выраженного всплеска" }[form?.signal];
    return [`${player.lastName} ${player.firstName} · ${player.team} · ${player.position}`,
      `Цена: ${player.price}к → ${item.suggestedPrice}к (${item.suggestedPrice > player.price ? "повысить" : "снизить"})`,
      ...averages, `Оценка формы: ${item.forecast.toFixed(1)} ФО/матч. Стабильность: ${stability}.`,
      ...(form ? [`Последние игры: ${form.recentPoints.join(" / ")} ФО; ${signal}. Положительных результатов за последние 5 игр: ${Math.round(form.positiveRate * 100)}%.`] : []),
      `Отдача на 1к: ${advantage > 0 ? "+" : ""}${advantage}% к взвешенной медиане игроков той же команды и позиции.`,
      ...(Number.isFinite(item.confidence) ? [`Надёжность оценки: ${Math.round(item.confidence * 100)}%. Сравнение с ${item.peerCount} игроками. Осторожный ориентир: ${item.targetPrice.toFixed(1)}к.`, item.decision] : []),
      ...(item.dataAgeDays > 21 ? [`Последний матч ${item.lastPlayedAt}: давность данных снижает надёжность оценки.`] : []),
      ...(item.budgetLimit ? [`Расчётная цена: ${item.fairPrice.toFixed(1)}к. Новая цена: ${(item.suggestedPrice / item.budgetLimit * 100).toFixed(1)}% бюджета ${item.budgetLimit}к.`] : []),
      ...(Number.isFinite(item.affordableRosterCost) ? [`Состав с игроком после рекомендаций: не дороже ${item.affordableRosterCost}к.`] : [])].join("\n");
  }
}
