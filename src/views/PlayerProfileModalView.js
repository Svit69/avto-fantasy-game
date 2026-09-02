import { PlayerMatchCalendarView } from "./PlayerMatchCalendarView.js";
import { PlayerPastTourView } from "./PlayerPastTourView.js";
import { versionAssetUrl } from "../utils/AssetUrlVersioner.js";

export class PlayerProfileModalView {
  constructor(calendarView = new PlayerMatchCalendarView(), pastTourView = new PlayerPastTourView()) {
    Object.assign(this, { calendarView, pastTourView });
  }

  render(player, selected, calendar, selectedMonth) {
    return `
      <div class="player-profile-scrim" data-close-player-profile></div>
      <section class="player-profile-modal" role="dialog" aria-modal="true" aria-label="${player.getFullName()}">
        <header class="profile-hero">
          <span class="profile-avatar"><img src="${versionAssetUrl(player.getImage())}" alt="${player.getFullName()}" /></span>
          <div class="profile-heading">
            <h2>${player.getLastName()}</h2>
            <p>${player.getTeam()} · ${this.#formatPosition(player.getPosition())}</p>
          </div>
          <button type="button" data-close-player-profile aria-label="Закрыть">×</button>
        </header>
        ${this.#renderActionRow(player, selected)}
        <div class="profile-stat-strip">
          ${this.#renderStat("Выбравшие команды", "0%")}
          ${this.#renderStat("Очки", `${player.getPoints()} оч.`)}
          ${this.#renderStat("Цена", player.getFormattedPrice())}
        </div>
        <div class="profile-body">${this.calendarView.render(player, calendar, selectedMonth)}${this.pastTourView.render(player)}</div>
      </section>`;
  }

  #renderStat(label, value) { return `<div><small>${label}</small><strong>${value}</strong></div>`; }

  #renderActionRow(player, selected) {
    const selectData = selected ? "" : `data-select-player="${player.getId()}"`;
    return `<button class="profile-action-row" type="button" ${selectData} ${selected ? "disabled" : ""}>
      <div class="profile-action-badge">${selected ? "✓" : "+"}</div><span>${selected ? "В составе" : "Добавить"}</span>
    </button>`;
  }

  #formatPosition(position) {
    const labels = { нападающий: "НАП", защитник: "ЗАЩ", вратарь: "ВРТ" };
    return labels[position] ?? position;
  }
}
