import path from "node:path";
import { fileURLToPath } from "node:url";
import { EnvironmentFileLoader } from "./EnvironmentFileLoader.js";
import { KhlServiceFactory } from "./KhlServiceFactory.js";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
new EnvironmentFileLoader().loadEnvironmentFile(path.join(rootDirectory, ".env"));
const [tournamentId, gameId] = process.argv.slice(2);
if (!tournamentId || !gameId) throw new Error("Usage: npm run khl:ingest -- <tournamentId> <gameId>");
const service = new KhlServiceFactory(rootDirectory).createIngestionService();
console.log(JSON.stringify(await service.ingestMatch(tournamentId, gameId), null, 2));
