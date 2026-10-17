import fs from "node:fs/promises";
import { INITIAL_PLAYERS } from "../src/data/players.js";
import { CALENDAR_MATCHES } from "../src/data/calendarSeed.js";
import { KhlMatchIngestionService } from "./KhlMatchIngestionService.js";
import { KhlMatchScopePolicy } from "./KhlMatchScopePolicy.js";
import { MhlOnlineHtmlParser } from "./MhlOnlineHtmlParser.js";
import { MhlMirrorDataProvider } from "./MhlMirrorDataProvider.js";

export const html = await fs.readFile(new URL("./fixtures/mhl-online-903207.html", import.meta.url), "utf8");
export const decisions = JSON.parse(await fs.readFile(new URL("./fixtures/mhl-online-decisions.json", import.meta.url), "utf8"));
export const players = structuredClone(INITIAL_PLAYERS);
export const calendarMatch = CALENDAR_MATCHES.find((match) => match.mhlGameId === "903207");
export function createProvider(catalog = players, content = html, expectedMatch = calendarMatch) {
  return new MhlMirrorDataProvider({ gameId: "903207", players: catalog, expectedMatch,
    dataSource: { loadGame: async () => new MhlOnlineHtmlParser().parseGame(content, "903207") } });
}
export function createMemoryFactory(matches = [], catalog = players) {
  const data = { matches: [...matches], playerStats: [], writes: 0 };
  const repository = { listMatches: async () => data.matches, readDatabase: async () => data,
    upsertMatch: async (match) => { data.writes++; data.matches = [...data.matches.filter((item) => item.id !== match.id), match]; },
    replaceMatchCollections: async (id, collections) => { data.playerStats = collections.playerStats; } };
  return { data, createRepository: () => repository, createPlayerCatalogRepository: () => ({ listPlayers: async () => catalog }),
    createIngestionService: (dataProvider) => new KhlMatchIngestionService({ dataProvider, repository,
      playerCatalogRepository: { listPlayers: async () => catalog }, scopePolicy: new KhlMatchScopePolicy() }) };
}
