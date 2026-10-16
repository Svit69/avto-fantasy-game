import fs from "node:fs/promises";
import { INITIAL_PLAYERS } from "../src/data/players.js";
import { KhlMirrorDataProvider } from "./KhlMirrorDataProvider.js";
import { KhlMatchIngestionService } from "./KhlMatchIngestionService.js";
import { KhlMatchScopePolicy } from "./KhlMatchScopePolicy.js";

export const fixture = JSON.parse(await fs.readFile(new URL("./fixtures/khl-online-902107.json", import.meta.url), "utf8"));
export const players = structuredClone(INITIAL_PLAYERS);
export const calendarMatch = { id: "test-902107", khlGameId: "902107", tourId: "october", league: "КХЛ",
  startsAt: "2026-10-06T17:00:00+03:00", homeTeam: "Автомобилист", awayTeam: "Авангард" };
export function createProvider(game = fixture, catalog = players, expectedMatch = calendarMatch) {
  return new KhlMirrorDataProvider({ gameId: "902107", players: catalog, expectedMatch, dataSource: { loadGame: async () => game } });
}
export function createMemoryFactory(matches = [], catalog = players) {
  const data = { matches: [...matches], playerStats: [], writes: 0 };
  const repository = { readDatabase: async () => data, listMatches: async () => data.matches,
    upsertMatch: async (match) => { data.writes++; data.matches = [...data.matches.filter((item) => item.id !== match.id), match]; },
    replaceMatchCollections: async (id, collections) => { data.playerStats = collections.playerStats; } };
  return { data, createRepository: () => repository, createPlayerCatalogRepository: () => ({ listPlayers: async () => catalog }),
    createIngestionService: (dataProvider) => new KhlMatchIngestionService({ dataProvider, repository,
      playerCatalogRepository: { listPlayers: async () => catalog }, scopePolicy: new KhlMatchScopePolicy() }) };
}
