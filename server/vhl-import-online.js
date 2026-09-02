import path from "node:path";
import { fileURLToPath } from "node:url";
import { EnvironmentFileLoader } from "./EnvironmentFileLoader.js";
import { KhlServiceFactory } from "./KhlServiceFactory.js";
import { VhlOnlineDataProvider } from "./VhlOnlineDataProvider.js";
import { VhlOnlineUrlResolver } from "./VhlOnlineUrlResolver.js";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
new EnvironmentFileLoader().loadEnvironmentFile(path.join(rootDirectory, ".env"));
const onlineGameId = new VhlOnlineUrlResolver().resolveGameId(process.argv[2]);
if (!onlineGameId) throw new Error("Usage: npm run vhl:ingest -- 899183");
const serviceFactory = new KhlServiceFactory(rootDirectory);
const players = await serviceFactory.createPlayerCatalogRepository().listPlayers();
const provider = new VhlOnlineDataProvider({ onlineGameId, players });
const result = await serviceFactory.createIngestionService(provider).ingestMatch("vhl-online", onlineGameId);
console.log(JSON.stringify(result, null, 2));
