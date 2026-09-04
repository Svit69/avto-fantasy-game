export class AdminRosterReportView {
  constructor(months = ["Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь", "Январь", "Февраль", "Март"]) {
    this.months = months;
  }

  renderMonthPrompt(chatId) {
    return this.#message(chatId, "Составы пользователей\nВыберите туровый месяц.", this.#createMonthKeyboard());
  }

  renderMonthlyRosters(chatId, { month, rosters, users, players }) {
    const monthlyRosters = rosters.filter((roster) => roster.month === month);
    const text = [`Составы пользователей: ${month}`, `Всего составов: ${monthlyRosters.length}`, ""]
      .concat(monthlyRosters.map((roster) => this.#renderRoster(roster, users, players))).join("\n");
    return this.#message(chatId, text || "Составов пока нет.", this.#createMonthKeyboard());
  }

  #renderRoster(roster, users, players) {
    const manager = users.find((user) => user.id === roster.userId);
    const rows = (roster.slots || []).map((slot) => this.#renderSlot(slot, players));
    return [`Менеджер: ${manager?.name || roster.userId}`, `Статус: ${roster.status || "confirmed"}`,
      `Бюджет: ${this.#calculateRosterBudget(roster)}к`, rows.join("\n") || "Слоты пустые"].join("\n");
  }

  #renderSlot(slot, players) {
    const player = players.find((candidate) => candidate.id === slot.playerId);
    const name = player ? `${player.firstName[0]}. ${player.lastName}` : slot.playerId || "Пусто";
    const price = slot.lockedPrice ?? "-";
    return `${slot.position}: ${name} — ${price}к`;
  }

  #calculateRosterBudget(roster) {
    return (roster.slots || []).reduce((sum, slot) => sum + Number(slot.lockedPrice || 0), 0);
  }

  #createMonthKeyboard() {
    return this.months.map((month) => [{ text: month, callback_data: `admin:rosters:${month}` }])
      .concat([[{ text: "В меню", callback_data: "admin:menu" }]]);
  }

  #message(chatId, text, inline_keyboard) {
    return { method: "sendMessage", chat_id: chatId, text, reply_markup: { inline_keyboard } };
  }
}
