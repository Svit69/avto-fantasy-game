import path from "node:path";
import { fileURLToPath } from "node:url";
import { EnvironmentFileLoader } from "./EnvironmentFileLoader.js";
import { KhlJsonDataProvider } from "./KhlJsonDataProvider.js";
import { KhlMatchDataRepository } from "./KhlMatchDataRepository.js";
import { KhlMatchIngestionService } from "./KhlMatchIngestionService.js";
import { KhlMatchScopePolicy } from "./KhlMatchScopePolicy.js";
import { PlayerCatalogRepository } from "./PlayerCatalogRepository.js";
import { TeamBrandResolver } from "./TeamBrandResolver.js";
import { INITIAL_PLAYERS } from "../src/data/players.js";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
new EnvironmentFileLoader().loadEnvironmentFile(path.join(rootDirectory, ".env"));
const [tournamentId, gameId] = process.argv.slice(2);
const service = new KhlMatchIngestionService({
  dataProvider: new KhlJsonDataProvider(path.join(rootDirectory, "storage/khl-source")),
  repository: new KhlMatchDataRepository(path.join(rootDirectory, process.env.KHL_DATABASE_PATH || "storage/khl-match-data.json")),
  playerCatalogRepository: new PlayerCatalogRepository(path.join(rootDirectory, process.env.PLAYER_DATABASE_PATH || "storage/players.json"), INITIAL_PLAYERS, new TeamBrandResolver()),
  scopePolicy: new KhlMatchScopePolicy(),
});
if (!tournamentId || !gameId) throw new Error("Usage: npm run khl:ingest -- <tournamentId> <gameId>");
console.log(JSON.stringify(await service.ingestMatch(tournamentId, gameId), null, 2));
