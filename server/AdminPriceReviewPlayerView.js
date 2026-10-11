export class AdminPriceReviewPlayerView {
  renderPlayers(chatId, report, requestedPage = 0) {
    const players = [...report.playerAssessments].sort((first, second) => `${first.player.team} ${first.player.lastName}`.localeCompare(`${second.player.team} ${second.player.lastName}`, "ru"));
    const lastPage = Math.max(0, Math.ceil(players.length / 10) - 1);
    const page = Math.max(0, Math.min(lastPage, Math.floor(Number(requestedPage) || 0)));
    const selected = players.slice(page * 10, page * 10 + 10);
    const text = [`Все игроки · сезон ${report.season}`, "Средние ФО: последние 5 / последние 10 / сезон. В скобках — число сыгранных матчей.",
      ...selected.map((item) => this.#formatPlayer(item)), `Страница ${page + 1}/${lastPage + 1}`].join("\n\n");
    const navigation = [];
    if (page > 0) navigation.push({ text: "Назад", callback_data: `admin:price_review_players:${page - 1}` });
    if (page < lastPage) navigation.push({ text: "Дальше", callback_data: `admin:price_review_players:${page + 1}` });
    const rows = navigation.length ? [navigation] : [];
    rows.push([{ text: "К рекомендациям", callback_data: "admin:price_review:0" }], [{ text: "В меню", callback_data: "admin:menu" }]);
    return { method: "sendMessage", chat_id: chatId, text, reply_markup: { inline_keyboard: rows } };
  }
  #formatPlayer(item) {
    const averages = item.summaries.map((summary) => summary.count ? `${summary.mean.toFixed(1)} (${summary.count})` : "нет данных").join(" / ");
    const reasons = { unchanged: "Цена без изменений", peers: "Недостаточно сопоставимых игроков", coverage: "Не хватает протоколов команды",
      budget: "Повышение не проходит по бюджету", recommendation: "Есть рекомендация", insufficient: "Недостаточно данных для цены" };
    const reason = !item.count ? "Нет сыгранных матчей за сезон" : item.count < 3 ? "Предварительная статистика: нужно минимум 3 матча" : reasons[item.reason];
    return [`${item.player.lastName} ${item.player.firstName} · ${item.player.team} · ${item.player.price}к`,
      averages, `Последний матч: ${item.lastPlayedAt || "нет"}. ${reason}.`].join("\n");
  }
}
