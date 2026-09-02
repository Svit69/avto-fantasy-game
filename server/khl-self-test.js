import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { INITIAL_PLAYERS } from "../src/data/players.js";
import { KhlJsonDataProvider } from "./KhlJsonDataProvider.js";
import { KhlMatchDataRepository } from "./KhlMatchDataRepository.js";
import { KhlMatchIngestionService } from "./KhlMatchIngestionService.js";
import { KhlMatchScopePolicy } from "./KhlMatchScopePolicy.js";
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
console.log("KHL self-test passed: Tryamkin = 80 FP");
