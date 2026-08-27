import { ROSTER_POSITIONS } from "../data/positions.js";

export class FilterSheetView {
  render(kind, filters, teams) {
    if (!kind) return "";

    return `
      <div class="filter-scrim" data-close-filter></div>
      <section class="filter-sheet">
        <header><h3>${this.#formatTitle(kind)}</h3><button type="button" data-close-filter>Применить</button></header>
        <div class="filter-options">${this.#renderOptions(kind, filters, teams)}</div>
      </section>
    `;
  }

  #renderOptions(kind, filters, teams) {
    if (kind === "position") return this.#renderPositionOptions(filters);
    if (kind === "team") return this.#renderTeamOptions(filters, teams);
    return this.#renderPriceOptions(filters);
  }

  #renderPositionOptions(filters) {
    return ["Все", ...Object.values(ROSTER_POSITIONS)]
      .map((position) => this.#renderOption("position", position, this.#formatPosition(position), filters.position === position))
      .join("");
  }

  #renderTeamOptions(filters, teams) {
    return ["Все", ...teams].map((team) => this.#renderOption("team", team, team, filters.team === team)).join("");
  }

  #renderPriceOptions(filters) {
    return [4, 6, 8, 10, 13]
      .map((price) => this.#renderOption("price", price, `до ${price}к`, filters.maxPrice === price))
      .join("");
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
