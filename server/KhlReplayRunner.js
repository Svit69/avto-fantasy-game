import { KhlFixtureDataProvider } from "./KhlFixtureDataProvider.js";
import { KhlMatchIngestionService } from "./KhlMatchIngestionService.js";

export class KhlReplayRunner {
  constructor({ fixtureRoot, repository, playerCatalogRepository, scopePolicy, wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms)) }) {
    Object.assign(this, { fixtureRoot, repository, playerCatalogRepository, scopePolicy, wait });
  }

  async replayMatch(tournamentId, gameId, options = {}) {
    const snapshots = await new KhlFixtureDataProvider(this.fixtureRoot).listSnapshots(tournamentId, gameId);
    const results = [];
    for (let index = 0; index < snapshots.length; index += 1) {
      if (options.step) await this.#waitForStep(index);
      else if (index > 0) await this.wait(this.#calculateDelay(snapshots, index, options.speed || 1));
      results.push(await this.#ingestSnapshot(tournamentId, gameId, index));
    }
    return results;
  }

  async #ingestSnapshot(tournamentId, gameId, index) {
    const dataProvider = new KhlFixtureDataProvider(this.fixtureRoot, index);
    return new KhlMatchIngestionService({ dataProvider, repository: this.repository, playerCatalogRepository: this.playerCatalogRepository, scopePolicy: this.scopePolicy }).ingestMatch(tournamentId, gameId);
  }

  #calculateDelay(snapshots, index, speed) {
    return Math.max(0, Number(snapshots[index].offsetSeconds || 0) - Number(snapshots[index - 1].offsetSeconds || 0)) * 1000 / speed;
  }

  #waitForStep(index) {
    process.stdout.write(`Press Enter for KHL snapshot ${index + 1}...`);
    return new Promise((resolve) => process.stdin.once("data", resolve));
  }
}
