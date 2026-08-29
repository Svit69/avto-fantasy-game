import { AVAILABLE_MONTHS } from "../data/months.js";

export class HeaderView {
  render() {
    return `
      <header class="app-header">
        <div class="header-content">
          <button class="icon-button" data-open-manager-menu aria-label="Открыть меню">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <div class="brand-anchor">
            <img class="brand-logo" src="/assets/avto_logo.png"
              alt="Логотип Автомобилиста" data-logo />
          </div>
          <select class="month-select" aria-label="Выбрать месяц">
            ${this.#renderMonthOptions()}
          </select>
        </div>
      </header>
    `;
  }

  #renderMonthOptions() {
    return AVAILABLE_MONTHS.map((month) => {
      const selected = month === "Сентябрь" ? "selected" : "";
      return `<option ${selected}>${month}</option>`;
    }).join("");
  }
}
