import path from "node:path";
import { KhlFixtureDataProvider } from "./KhlFixtureDataProvider.js";
import { KhlJsonDataProvider } from "./KhlJsonDataProvider.js";
import { KhlMatchIngestionService } from "./KhlMatchIngestionService.js";
import { KhlMatchScopePolicy } from "./KhlMatchScopePolicy.js";
import { KhlOfficialDataProvider } from "./KhlOfficialDataProvider.js";
import { StorageDriverFactory } from "./StorageDriverFactory.js";

export class KhlServiceFactory {
  constructor(rootDirectory) { this.rootDirectory = rootDirectory; this.storageFactory = new StorageDriverFactory(this.#resolve.bind(this)); }
  createRepository() { return this.storageFactory.createMatchDataRepository(); }
  createFixtureRoot() { return this.#resolve(process.env.KHL_FIXTURE_PATH || "storage/khl-fixtures"); }
  createPlayerCatalogRepository() { return this.storageFactory.createPlayerCatalogRepository(); }
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
