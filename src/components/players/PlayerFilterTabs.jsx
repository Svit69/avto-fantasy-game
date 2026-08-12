import { playerFilters } from "../../data/playerFilters.js";

export function PlayerFilterTabs({ activeFilter, onFilterChange }) {
  return (
    <nav className="player-filters" aria-label="Фильтр игроков">
      {playerFilters.map((filter) => (
        <button className={filter.value === activeFilter ? "player-filters__item active" : "player-filters__item"} type="button" key={filter.value} onClick={() => onFilterChange(filter.value)}>
          {filter.label}
        </button>
      ))}
    </nav>
  );
}
