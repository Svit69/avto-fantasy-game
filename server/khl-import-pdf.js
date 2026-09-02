import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { EnvironmentFileLoader } from "./EnvironmentFileLoader.js";
import { KhlProtocolPdfDataProvider } from "./KhlProtocolPdfDataProvider.js";
import { KhlServiceFactory } from "./KhlServiceFactory.js";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
new EnvironmentFileLoader().loadEnvironmentFile(path.join(rootDirectory, ".env"));
const [pdfPath, tournamentId, gameId] = process.argv.slice(2);
if (!pdfPath || !tournamentId || !gameId) throw new Error("Usage: npm run khl:import-pdf -- protocol.pdf 1369 898099");

const serviceFactory = new KhlServiceFactory(rootDirectory);
const playerCatalogRepository = serviceFactory.createPlayerCatalogRepository();
const players = await playerCatalogRepository.listPlayers();
const pdfBuffer = await fs.readFile(path.resolve(pdfPath));
const provider = new KhlProtocolPdfDataProvider({ pdfBuffer, players, identity: { tournamentId, gameId, homeTeamId: "190", league: "КХЛ", status: "finished" } });
const result = await serviceFactory.createIngestionService(provider).ingestMatch(tournamentId, gameId);
console.log(JSON.stringify(result, null, 2));
