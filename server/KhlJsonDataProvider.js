import fs from "node:fs/promises";
import path from "node:path";

export class KhlJsonDataProvider {
  constructor(sourceDirectory) { this.sourceDirectory = sourceDirectory; }

  async getMatch(tournamentId, gameId) {
    return (await this.#readSourceFile(gameId)).match || { tournamentId, gameId };
  }

  async getPlayByPlay(tournamentId, gameId) {
    return (await this.#readSourceFile(gameId)).events || [];
  }

  async getProtocol(tournamentId, gameId) {
    return (await this.#readSourceFile(gameId)).protocol || {};
  }

  async getLineups(tournamentId, gameId) {
    return (await this.#readSourceFile(gameId)).lineups || {};
  }

  async #readSourceFile(gameId) {
    return JSON.parse(await fs.readFile(path.join(this.sourceDirectory, `${gameId}.json`), "utf8"));
  }
}
