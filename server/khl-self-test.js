import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { INITIAL_PLAYERS } from "../src/data/players.js";
import { KhlJsonDataProvider } from "./KhlJsonDataProvider.js";
import { KhlFixtureImporter } from "./KhlFixtureImporter.js";
import { KhlMatchDataRepository } from "./KhlMatchDataRepository.js";
import { KhlMatchIngestionService } from "./KhlMatchIngestionService.js";
import { KhlMatchScopePolicy } from "./KhlMatchScopePolicy.js";
import { KhlReplayRunner } from "./KhlReplayRunner.js";
import { PlayerCatalogRepository } from "./PlayerCatalogRepository.js";
import { TeamBrandResolver } from "./TeamBrandResolver.js";

const root = path.resolve(".");
const temp = await fs.mkdtemp(path.join(os.tmpdir(), "khl-self-test-"));
const repository = new KhlMatchDataRepository(path.join(temp, "khl.json"));
const service = new KhlMatchIngestionService({
  dataProvider: new KhlJsonDataProvider(path.join(root, "server/test-fixtures/khl-source")),
  repository,
  playerCatalogRepository: new PlayerCatalogRepository(path.join(temp, "players.json"), INITIAL_PLAYERS, new TeamBrandResolver()),
  scopePolicy: new KhlMatchScopePolicy("avtomobilist"),
});
await service.ingestMatch("1369", "898228");
await service.ingestMatch("1369", "898228");
const stats = await repository.listStatsByGameId("898228");
const tryamkin = stats.find((stat) => stat.playerId === "tryamkin");
if (tryamkin?.fantasyPoints !== 80 || stats.length !== 1) throw new Error("khl_tryamkin_self_test_failed");
const replayRepository = new KhlMatchDataRepository(path.join(temp, "khl-replay.json"));
const runner = new KhlReplayRunner({ fixtureRoot: path.join(root, "server/test-fixtures/khl-replay"), repository: replayRepository, playerCatalogRepository: service.playerCatalogRepository, scopePolicy: new KhlMatchScopePolicy("avtomobilist"), wait: async () => {} });
await runner.replayMatch("1369", "898228", { speed: 10 });
if ((await replayRepository.listStatsByGameId("898228"))[0]?.fantasyPoints !== 80) throw new Error("khl_replay_self_test_failed");
const officialScope = new KhlMatchIngestionService({ dataProvider: service.dataProvider, repository, playerCatalogRepository: service.playerCatalogRepository, scopePolicy: new KhlMatchScopePolicy("37") });
if (!(await officialScope.ingestMatch("1369", "898099")).ok) throw new Error("khl_official_team_scope_failed");
const harPath = path.join(temp, "sample.har");
await fs.writeFile(harPath, JSON.stringify({ log: { entries: [{ request: { headers: [{ name: "Cookie", value: "secret" }, { name: "Accept", value: "application/json" }] }, response: { headers: [{ name: "Authorization", value: "secret" }], content: { mimeType: "application/json", text: JSON.stringify({ match: { tournamentId: "1369", gameId: "898099", homeTeamId: "190", awayTeamId: "37", league: "КХЛ" }, events: [] }) } } }] } }), "utf8");
const imported = await new KhlFixtureImporter(path.join(temp, "fixtures")).importSource(harPath);
const sanitized = JSON.parse(await fs.readFile(path.join(imported.fixtureDirectory, "001-raw-sanitized.json"), "utf8"));
const headerNames = [...sanitized.log.entries[0].request.headers, ...sanitized.log.entries[0].response.headers].map((header) => header.name.toLowerCase());
if (headerNames.includes("cookie") || headerNames.includes("authorization")) throw new Error("khl_har_sanitizer_failed");
console.log("KHL self-test passed: Tryamkin = 80 FP");
