const POSITION_GROUPS = [
  ["нападающий", "Нападающие"],
  ["защитник", "Защитники"],
  ["вратарь", "Вратарь"],
];

export class AdminRosterReportFormatter {
  formatReport({ month, rosters, users, players, total, page, pageCount }) {
    if (!total) return `<b>Составы пользователей: ${this.#escape(month)}</b>\n\nСохранённых составов за этот тур пока нет.`;
    const header = [`<b>Составы пользователей: ${this.#escape(month)}</b>`, `Всего составов: <b>${total}</b>`, `Страница: ${page + 1}/${pageCount}`, ""];
    return header.concat(rosters.map((roster, index) => this.#renderRoster(roster, index, page, users, players))).join("\n");
  }

  #renderRoster(roster, index, page, users, players) {
    const manager = users.find((user) => user.id === roster.userId);
    const title = `<b>${page * 5 + index + 1}. ${this.#escape(manager?.name || "Менеджер")}</b>`;
    const meta = [`ID: <code>${this.#escape(String(roster.userId))}</code>`, `Статус: ${this.#escape(roster.status || "confirmed")}`,
      `Игроков: <b>${(roster.slots || []).length}/6</b>`, `Стоимость состава: <b>${this.#calculateBudget(roster)}к</b>`];
    return [title, meta.join(" | "), this.#renderLines(roster, players), ""].join("\n");
  }

  #renderLines(roster, players) {
    return POSITION_GROUPS.map(([position, title]) => this.#renderPosition(roster, players, position, title)).join("\n");
  }

  #renderPosition(roster, players, position, title) {
    const slots = (roster.slots || []).filter((slot) => slot.position === position);
    if (!slots.length) return `<b>${title}</b>: —`;
    const rows = slots.map((slot) => this.#renderSlot(slot, players)).join("; ");
    return `<b>${title}</b>: ${rows}`;
  }

  #renderSlot(slot, players) {
    const player = players.find((candidate) => candidate.id === slot.playerId);
    const name = player ? `${player.firstName[0]}. ${player.lastName}` : slot.playerId || "Пусто";
    return `${this.#escape(name)} — ${this.#escape(String(slot.lockedPrice ?? "-"))}к`;
  }

  #calculateBudget(roster) {
    return (roster.slots || []).reduce((sum, slot) => sum + Number(slot.lockedPrice || 0), 0);
  }

  #escape(value) {
    return value.replace(/[&<>]/g, (symbol) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[symbol]));
  }
}
