import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";
import { EnvironmentFileLoader } from "./EnvironmentFileLoader.js";
import { KhlServiceFactory } from "./KhlServiceFactory.js";
import { KhlMirrorDataProvider } from "./KhlMirrorDataProvider.js";
import { KhlMatchIngestionService } from "./KhlMatchIngestionService.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
new EnvironmentFileLoader().loadEnvironmentFile(path.join(root, ".env"));
const gameId = process.argv[2];
if (!/^\d+$/.test(gameId || "")) throw new Error("Usage: npm run khl:preview -- <gameId> [--fixture <game-json>]");
const factory = new KhlServiceFactory(root);
const players = await factory.createPlayerCatalogRepository().listPlayers();
const fixtureIndex = process.argv.indexOf("--fixture");
const dataSource = fixtureIndex < 0 ? undefined : { loadGame: async () => JSON.parse(await fs.readFile(process.argv[fixtureIndex + 1], "utf8")) };
const provider = new KhlMirrorDataProvider({ gameId, players, dataSource });
const repository = { readDatabase: async () => ({ matches: [] }), upsertMatch: async () => {}, replaceMatchCollections: async () => {} };
const result = await new KhlMatchIngestionService({ dataProvider: provider, repository,
  playerCatalogRepository: { listPlayers: async () => players }, scopePolicy: factory.createScopePolicy() }).ingestMatch("preview", gameId);
const names = new Map(players.map((player) => [player.id, `${player.lastName} ${player.firstName}`]));
console.log(JSON.stringify({ dryRun: true, ...result, unmatchedPlayers: provider.unmatchedPlayers,
  playerStats: result.playerStats?.map((stat) => ({ player: names.get(stat.playerId), ...stat })) }, null, 2));
