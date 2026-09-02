import path from "node:path";
import { INITIAL_PLAYERS } from "../src/data/players.js";
import { KhlFixtureDataProvider } from "./KhlFixtureDataProvider.js";
import { KhlJsonDataProvider } from "./KhlJsonDataProvider.js";
import { KhlMatchDataRepository } from "./KhlMatchDataRepository.js";
import { KhlMatchIngestionService } from "./KhlMatchIngestionService.js";
import { KhlMatchScopePolicy } from "./KhlMatchScopePolicy.js";
import { KhlOfficialDataProvider } from "./KhlOfficialDataProvider.js";
import { PlayerCatalogRepository } from "./PlayerCatalogRepository.js";
import { TeamBrandResolver } from "./TeamBrandResolver.js";

export class KhlServiceFactory {
  constructor(rootDirectory) { this.rootDirectory = rootDirectory; }
  createRepository() { return new KhlMatchDataRepository(this.#resolve(process.env.KHL_DATABASE_PATH || "storage/khl-match-data.json")); }
  createFixtureRoot() { return this.#resolve(process.env.KHL_FIXTURE_PATH || "storage/khl-fixtures"); }
  createPlayerCatalogRepository() { return new PlayerCatalogRepository(this.#resolve(process.env.PLAYER_DATABASE_PATH || "storage/players.json"), INITIAL_PLAYERS, new TeamBrandResolver()); }
  createScopePolicy() { return new KhlMatchScopePolicy(); }

  createDataProvider() {
    const provider = process.env.KHL_DATA_PROVIDER || "json";
    if (provider === "fixture") return new KhlFixtureDataProvider(this.createFixtureRoot());
    if (provider === "official") return new KhlOfficialDataProvider();
    return new KhlJsonDataProvider(this.#resolve(process.env.KHL_JSON_SOURCE_PATH || "storage/khl-source"));
  }

  createIngestionService(dataProvider = this.createDataProvider()) {
    return new KhlMatchIngestionService({ dataProvider, repository: this.createRepository(), playerCatalogRepository: this.createPlayerCatalogRepository(), scopePolicy: this.createScopePolicy() });
  }

  #resolve(filePath) { return path.join(this.rootDirectory, filePath); }
}
