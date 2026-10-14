import { Player } from "/src/models/Player.js";
import { PlayerSelectionState } from "/src/models/PlayerSelectionState.js";
import { PlayerSelectionController } from "/src/controllers/PlayerSelectionController.js";
import { PlayerMarketStatsStore } from "/src/services/PlayerMarketStatsStore.js";
import { MarketStatsScrollSynchronizer } from "/src/services/MarketStatsScrollSynchronizer.js";
import { PlayerSelectionDrawerView } from "/src/views/PlayerSelectionDrawerView.js";
import { PlayerMarketTableView } from "/src/views/PlayerMarketTableView.js";
import { FilterSheetView } from "/src/views/FilterSheetView.js";

const root = document.querySelector("#test-root");
const state = new PlayerSelectionState();
const players = [["a", "Гамзаков", "Авто", "нападающий", 20, 30], ["b", "Защитник", "Горняк", "защитник", 10, 40], ["c", "Нападающий", "Авто", "нападающий", 5, -5]]
  .map(([id, lastName, team, position, price, points]) => {
    const player = new Player({ id, lastName, team, position, price, firstName: "Михаил", image: "/assets/avto_logo.png" });
    PlayerMarketStatsStore.applyPlayerStats(player, { fantasyPoints: points, goals: 2, assists: 3 }); return player;
  });
const roster = { isEditable: () => true, getSlotByIndex: () => ({ getIndex: () => 0, getPosition: () => "нападающий" }),
  getSelectedPlayerIds: () => [], canSelectPlayerFromClub: () => true, findAvailableSlotForPlayer: () => ({}), calculateFilledPlayersCount: () => 0, calculateTotalSlotsCount: () => 6 };
const emptyView = { render: () => "" };
new PlayerSelectionController(root, roster, players, {}, new PlayerSelectionDrawerView(emptyView, new PlayerMarketTableView(), new FilterSheetView(), emptyView), state, new MarketStatsScrollSynchronizer()).connectPlayerSelectionActions();
const click = (selector) => { const target = root.querySelector(selector); if (!target) throw Error(selector); target.click(); };
const rows = () => [...root.querySelectorAll("[data-select-player]")].map((row) => row.dataset.selectPlayer).join(",");
const check = (value, message) => { if (!value) throw Error(message); };
const wait = () => new Promise((resolve) => setTimeout(resolve, 180));
try {
  click(".empty-player-slot"); check(rows() === "a,c", "Slot position filter");
  click("[data-close-player-panel]"); await wait(); click("[data-open-player-panel]"); check(rows() === "a,b,c", "Search all players");
  click('[data-market-sort="fantasyPoints"]'); check(rows() === "b,a,c", "Descending points");
  click('[data-market-sort="fantasyPoints"]'); check(rows() === "c,a,b", "Ascending points");
  click('[data-open-filter="team"]'); click('[data-filter-value="Горняк"]'); await wait(); check(rows() === "b", "Team filter");
  click('[data-open-filter="team"]'); click('[data-filter-value="Все"]'); await wait();
  click('[data-open-filter="position"]'); click('[data-filter-value="вратарь"]'); await wait(); check(rows() === "", "Empty position");
  click('[data-open-filter="position"]'); click('[data-filter-value="Все"]'); await wait();
  click('[data-open-filter="price"]'); const range = root.querySelector("[data-price-filter-range]");
  range.value = "10"; range.dispatchEvent(new Event("input", { bubbles: true })); check(rows() === "c,b", "Live price filter");
  click("[data-close-filter]"); await wait(); check(rows() === "c,b", "Applied price filter");
  click('[data-open-filter="price"]'); const resetRange = root.querySelector("[data-price-filter-range]");
  resetRange.value = "20"; resetRange.dispatchEvent(new Event("input", { bubbles: true })); click("[data-close-filter]"); await wait();
  root.dispatchEvent(new Event("player-market-stats-updated")); check(rows() === "c,a,b", "Async stats refresh");
  check(root.querySelector('[data-select-player="a"]').textContent.includes("30"), "Real average points");
  for (const image of root.querySelectorAll("img")) await image.decode();
  const bounds = root.querySelector(".player-selection-drawer").getBoundingClientRect();
  check(bounds.left >= 0 && bounds.right <= innerWidth + 1, "Responsive drawer framing");
  document.body.dataset.test = "passed";
} catch (error) { document.body.dataset.test = "failed"; document.body.dataset.error = error.message; }
