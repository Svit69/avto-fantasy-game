import assert from "node:assert/strict";
import { Player } from "../src/models/Player.js";
import { PlayerMarketQuery } from "../src/services/PlayerMarketQuery.js";
import { PlayerMarketStatsStore } from "../src/services/PlayerMarketStatsStore.js";
import { PlayerMarketTableView } from "../src/views/PlayerMarketTableView.js";

const players = [
  { id: "a", lastName: "А", position: "нападающий", team: "Авто", price: 20 },
  { id: "b", lastName: "Б", position: "защитник", team: "Горняк", price: 10 },
  { id: "c", lastName: "В", position: "нападающий", team: "Авто", price: 5 },
  { id: "gone", lastName: "Г", position: "нападающий", team: "Авто", price: 1, status: "left_game" },
].map((data) => new Player({ firstName: "Игрок", ...data }));
PlayerMarketStatsStore.applyPlayerStats(players[0], { fantasyPoints: 30, goals: 2, assists: 1 });
PlayerMarketStatsStore.applyPlayerStats(players[1], { fantasyPoints: -5, goals: 0, assists: 8 });
const query = new PlayerMarketQuery();
const filters = { position: "Все", team: "Все", maxPrice: null };
const select = (patch) => query.selectPlayers(players, { ...filters, ...patch }).map((player) => player.getId());
assert.deepEqual(select({}), ["a", "b", "c"]);
assert.deepEqual(select({ position: "нападающий", team: "Авто", maxPrice: 10 }), ["c"]);
assert.deepEqual(select({ position: "вратарь" }), []);
assert.deepEqual(select({ maxPrice: 0 }), []);
assert.deepEqual(select({ sortField: "fantasyPoints", sortDirection: "desc" }), ["a", "c", "b"]);
assert.deepEqual(select({ sortField: "fantasyPoints", sortDirection: "asc" }), ["b", "c", "a"]);
assert.deepEqual(select({ sortField: "assists" }), ["b", "a", "c"]);
const table = new PlayerMarketTableView();
const roster = { getSelectedPlayerIds: () => [], canSelectPlayerFromClub: () => true, findAvailableSlotForPlayer: () => ({}) };
const html = table.render(players, roster, filters);
assert(html.includes('<span>30</span>'));
assert(html.includes('<span>2</span><span>1</span>'));
assert(html.includes('data-market-sort="goals"'));
assert(table.render(players, roster, { ...filters, maxPrice: 0 }).includes("Нет подходящих игроков"));
console.log("Market filters, sorting and real statistics rendering self-test passed");
