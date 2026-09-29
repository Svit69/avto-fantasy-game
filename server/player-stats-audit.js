import path from "node:path";
import { fileURLToPath } from "node:url";
import { EnvironmentFileLoader } from "./EnvironmentFileLoader.js";
import { KhlServiceFactory } from "./KhlServiceFactory.js";
import { StorageDriverFactory } from "./StorageDriverFactory.js";
import { StoredPlayerStatsAuditor } from "./StoredPlayerStatsAuditor.js";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
new EnvironmentFileLoader().loadEnvironmentFile(path.join(rootDirectory, ".env"));
const resolveStoragePath = (filePath) => path.join(rootDirectory, filePath);
const storageFactory = new StorageDriverFactory(resolveStoragePath);
const serviceFactory = new KhlServiceFactory(rootDirectory);
const [calendar, database, players] = await Promise.all([
  storageFactory.createCalendarRepository().listCalendar(),
  serviceFactory.createRepository().readDatabase(),
  serviceFactory.createPlayerCatalogRepository().listPlayers(),
]);
const issues = new StoredPlayerStatsAuditor().audit({ calendar, database, players });
console.log(JSON.stringify({ ok: issues.length === 0, issuesFound: issues.length, issues }, null, 2));
if (issues.length) process.exitCode = 1;
