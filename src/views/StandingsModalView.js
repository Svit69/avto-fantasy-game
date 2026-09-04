export class StandingsModalView {
  render(standings) {
    return `<div class="standings-scrim" data-close-standings></div>
      <section class="standings-modal" role="dialog" aria-modal="true" aria-label="Таблица менеджеров">
        <header><button type="button" data-close-standings>×</button><span>${standings.month}</span><h2>Таблица</h2></header>
        ${this.#renderBody(standings)}
      </section>`;
  }

  #renderBody(standings) {
    if (!standings.entries.length) return `<div class="standings-empty"><b>Пока нет менеджеров</b><span>После сохранения первых составов здесь появится таблица тура.</span></div>`;
    return `<div class="standings-leaders">${standings.leaders.map((entry) => this.#renderCompactEntry(entry, standings.currentUser)).join("")}</div>
      ${this.#renderCurrentUserPin(standings)}
      <div class="standings-table">${standings.entries.map((entry) => this.#renderTableEntry(entry, standings.currentUser)).join("")}</div>`;
  }

  #renderCurrentUserPin(standings) {
    const current = standings.currentUser;
    if (!current || standings.leaders.some((entry) => entry.userId === current.userId)) return "";
    return `<button class="standings-current-pin" data-scroll-current-standing type="button">${this.#renderEntryContent(current, true)}<small>Нажмите, чтобы перейти к своему месту</small></button>`;
  }

  #renderCompactEntry(entry, currentUser) {
    return `<button class="standings-leader ${this.#currentClass(entry, currentUser)}" data-view-manager-roster="${entry.userId}" type="button">${this.#renderEntryContent(entry, false)}</button>`;
  }

  #renderTableEntry(entry, currentUser) {
    return `<button class="standings-row ${this.#currentClass(entry, currentUser)}" data-standing-user="${entry.userId}" data-view-manager-roster="${entry.userId}" type="button">${this.#renderEntryContent(entry, false)}</button>`;
  }

  #renderEntryContent(entry, isPinned) {
    return `<strong>${entry.place}</strong><span><b>${entry.name}</b><small>${entry.playersCount}/6 игроков</small></span><em>${entry.points} оч.</em>${isPinned ? "" : ""}`;
  }

  #currentClass(entry, currentUser) { return currentUser?.userId === entry.userId ? "is-current-user" : ""; }
}
