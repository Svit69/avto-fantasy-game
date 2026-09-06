import path from "node:path";
import { fileURLToPath } from "node:url";
import { EnvironmentFileLoader } from "./EnvironmentFileLoader.js";
import { CalendarStorageFactory } from "./CalendarStorageFactory.js";
import { KhlServiceFactory } from "./KhlServiceFactory.js";
import { VhlOnlineDataProvider } from "./VhlOnlineDataProvider.js";
import { VhlOnlineCalendarMatchResolver } from "./VhlOnlineCalendarMatchResolver.js";
import { VhlProtocolSourceResolver } from "./VhlProtocolSourceResolver.js";
import { VhlReportDataProvider } from "./VhlReportDataProvider.js";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
new EnvironmentFileLoader().loadEnvironmentFile(path.join(rootDirectory, ".env"));
const protocolSource = new VhlProtocolSourceResolver().resolveSource(process.argv[2]);
if (!protocolSource) throw new Error("Usage: npm run vhl:ingest -- 899183");
const serviceFactory = new KhlServiceFactory(rootDirectory);
const players = await serviceFactory.createPlayerCatalogRepository().listPlayers();
const storage = new CalendarStorageFactory((filePath) => path.join(rootDirectory, filePath));
const calendarResolver = new VhlOnlineCalendarMatchResolver(storage.createCalendarRepository());
const calendarMatch = await calendarResolver.findMatchByOnlineGameId(protocolSource.gameId);
const identity = calendarResolver.createProviderIdentity(calendarMatch, protocolSource.gameId);
const provider = protocolSource.type === "report" ? new VhlReportDataProvider({ source: protocolSource, players, identity })
  : new VhlOnlineDataProvider({ onlineGameId: protocolSource.gameId, players, identity });
const result = await serviceFactory.createIngestionService(provider).ingestMatch(identity.tournamentId || "vhl-online", protocolSource.gameId);
console.log(JSON.stringify(result, null, 2));
