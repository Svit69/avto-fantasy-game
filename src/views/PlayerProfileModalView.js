export class PlayerProfileModalView {
  render(player, selected) {
    return `
      <div class="player-profile-scrim" data-close-player-profile></div>
      <section class="player-profile-modal" role="dialog" aria-modal="true" aria-label="${player.getFullName()}">
        <header class="profile-hero">
          <span class="profile-avatar"><img src="${player.getImage()}" alt="${player.getFullName()}" /></span>
          <div class="profile-heading">
            <h2>${player.getLastName()}</h2>
            <p>${player.getTeam()} · ${this.#formatPosition(player.getPosition())}</p>
          </div>
          <button type="button" data-close-player-profile aria-label="Закрыть">×</button>
        </header>
        <div class="profile-action-row">
          <div class="profile-action-badge">${selected ? "✓" : "+"}</div>
          <span>${selected ? "В составе" : "Добавить"}</span>
        </div>
        <div class="profile-stat-strip">
          ${this.#renderStat("Выбравшие команды", "0%")}
          ${this.#renderStat("Очки", `${player.getPoints()} оч.`)}
          ${this.#renderStat("Цена", player.getFormattedPrice())}
        </div>
        <div class="profile-body">${this.#renderStageBlock()}${this.#renderSeasonBlock(player)}</div>
      </section>`;
  }

  #renderStat(label, value) { return `<div><small>${label}</small><strong>${value}</strong></div>`; }

  #renderStageBlock() {
    return `<article class="profile-panel"><h3>Общий этап</h3><p>Календарь и игровые туры появятся после старта месяца.</p><a href="#">Как начисляются очки</a></article>`;
  }

  #renderSeasonBlock(player) {
    return `<article class="profile-panel"><h3>Прошлый сезон</h3>${this.#renderSeasonRows(player)}<footer><b>Итого</b><strong>${player.getPoints()} оч.</strong></footer></article>`;
  }

  #renderSeasonRows(player) {
    const rows = [["Номер игрока", `№${player.getNumber() || "—"}`], ["Матчи", "0"], ["Голы", "0 оч."], ["Передачи", "0 оч."]];
    return rows.map(([label, value]) => `<div class="profile-season-row"><span>${label}</span><b>${value}</b></div>`).join("");
  }

  #formatPosition(position) {
    const labels = { нападающий: "НАП", защитник: "ЗАЩ", вратарь: "ВРТ" };
    return labels[position] ?? position;
  }
}
