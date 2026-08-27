import { ROSTER_POSITIONS } from "../data/positions.js";
import { PriceRangeFilterView } from "./PriceRangeFilterView.js";

export class FilterSheetView {
  render(kind, filters, teams, priceRange) {
    if (!kind) return "";

    return `
      <div class="filter-scrim" data-close-filter></div>
      <section class="filter-sheet">
        <header><h3>${this.#formatTitle(kind)}</h3><button type="button" data-close-filter>Применить</button></header>
        <div class="filter-options">${this.#renderOptions(kind, filters, teams, priceRange)}</div>
      </section>
    `;
  }

  #renderOptions(kind, filters, teams, priceRange) {
    if (kind === "position") return this.#renderPositionOptions(filters);
    if (kind === "team") return this.#renderTeamOptions(filters, teams);
    return new PriceRangeFilterView().render(filters, priceRange);
  }

  #renderPositionOptions(filters) {
    return ["Все", ...Object.values(ROSTER_POSITIONS)]
      .map((position) => this.#renderOption("position", position, this.#formatPosition(position), filters.position === position))
      .join("");
  }

  #renderTeamOptions(filters, teams) {
    return ["Все", ...teams].map((team) => this.#renderOption("team", team, team, filters.team === team)).join("");
  }

  #renderOption(kind, value, label, selected) {
    return `<button class="${selected ? "is-active" : ""}" type="button" data-filter-kind="${kind}" data-filter-value="${value}">${label}</button>`;
  }

  #formatTitle(kind) {
    return { position: "Позиция", team: "Команда", price: "Цена" }[kind];
  }

  #formatPosition(position) {
    const labels = { Все: "Все", нападающий: "Нападающие", защитник: "Защитники", вратарь: "Вратари" };
    return labels[position] ?? position;
  }
}
