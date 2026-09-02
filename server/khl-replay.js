import path from "node:path";
import { fileURLToPath } from "node:url";
import { EnvironmentFileLoader } from "./EnvironmentFileLoader.js";
import { KhlReplayRunner } from "./KhlReplayRunner.js";
import { KhlServiceFactory } from "./KhlServiceFactory.js";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
new EnvironmentFileLoader().loadEnvironmentFile(path.join(rootDirectory, ".env"));
const [tournamentId, gameId] = process.argv.slice(2);
if (!tournamentId || !gameId) throw new Error("Usage: npm run khl:replay -- 1369 898228 --speed=10");
const serviceFactory = new KhlServiceFactory(rootDirectory);
const speed = Number((process.argv.find((arg) => arg.startsWith("--speed=")) || "").split("=")[1] || 1);
const step = process.argv.includes("--step");
const runner = new KhlReplayRunner({ fixtureRoot: serviceFactory.createFixtureRoot(), repository: serviceFactory.createRepository(), playerCatalogRepository: serviceFactory.createPlayerCatalogRepository(), scopePolicy: serviceFactory.createScopePolicy() });
console.log(JSON.stringify(await runner.replayMatch(tournamentId, gameId, { speed, step }), null, 2));
