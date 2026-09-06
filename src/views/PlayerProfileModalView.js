import { AssetImageView } from "./AssetImageView.js";
import { PlayerMatchCalendarView } from "./PlayerMatchCalendarView.js";
import { PlayerPastTourView } from "./PlayerPastTourView.js";
import { PlayerProfileStatStripView } from "./PlayerProfileStatStripView.js";

export class PlayerProfileModalView {
  constructor(calendarView = new PlayerMatchCalendarView(), pastTourView = new PlayerPastTourView(), imageView = new AssetImageView(), statStripView = new PlayerProfileStatStripView()) {
    Object.assign(this, { calendarView, pastTourView, imageView, statStripView });
  }

  render(player, selected, calendar, selectedMonth, tourStats) {
    const statsTitle = this.#resolveStatsTitle(calendar, selectedMonth);
    return `
      <div class="player-profile-scrim" data-close-player-profile></div>
      <section class="player-profile-modal" role="dialog" aria-modal="true" aria-label="${player.getFullName()}">
        <header class="profile-hero">
          <span class="profile-avatar">${this.#renderAvatar(player)}</span>
          <div class="profile-heading">
            <h2>${player.getLastName()}</h2><p>${player.getTeam()} · ${this.#formatPosition(player.getPosition())}</p>
          </div>
          <button type="button" data-close-player-profile aria-label="Закрыть">×</button>
        </header>
        ${this.#renderActionRow(player, selected)}
        ${this.statStripView.render(player)}
        <div class="profile-body">${this.calendarView.render(player, calendar, selectedMonth)}${this.pastTourView.render(player, tourStats, statsTitle)}</div>
      </section>`;
  }

  #renderAvatar(player) {
    return this.imageView.renderPlayerImage({ src: player.getImage(), alt: player.getFullName(), loading: "eager", priority: "high" });
  }

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
  #resolveStatsTitle(calendar, month) {
    const tour = calendar.tours.find((item) => item.month === month);
    const now = Date.now(); const started = Date.parse(tour?.deadlineAt || tour?.startsAt) <= now;
    return started && Date.parse(tour?.endsAt || tour?.deadlineAt) >= now ? "Текущий тур" : "Прошлый тур";
  }
}
