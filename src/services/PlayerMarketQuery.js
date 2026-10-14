import { PlayerMarketStatsStore } from "./PlayerMarketStatsStore.js";

export class PlayerMarketQuery {
  selectPlayers(players, filters) {
    const maximum = filters.maxPrice == null ? Infinity : Number(filters.maxPrice);
    const field = filters.sortField || "price";
    const direction = filters.sortDirection === "asc" ? 1 : -1;
    return players.filter((player) => player.isAvailableForSelection())
      .filter((player) => filters.position === "Все" || player.getPosition() === filters.position)
      .filter((player) => filters.team === "Все" || player.getTeam() === filters.team)
      .filter((player) => Number(player.getPrice()) <= maximum)
      .sort((first, second) => direction * (this.#readSortValue(first, field) - this.#readSortValue(second, field))
        || first.getLastName().localeCompare(second.getLastName(), "ru"));
  }
  #readSortValue(player, field) {
    if (field === "price") return Number(player.getPrice()) || 0;
    if (field === "selectionPercent") return player.getSelectionPercent();
    return PlayerMarketStatsStore.readPlayerStats(player)[field] || 0;
  }
}
