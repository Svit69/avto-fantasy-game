import fs from "node:fs/promises";
import path from "node:path";
import { KhlFixtureDirectory } from "./KhlFixtureDirectory.js";

export class KhlFixtureDataProvider {
  constructor(rootDirectory, snapshotIndex = null) {
    Object.assign(this, { directory: new KhlFixtureDirectory(rootDirectory), snapshotIndex });
  }

  async getMatch(tournamentId, gameId) {
    return (await this.#readSnapshot(tournamentId, gameId)).match || { tournamentId, gameId };
  }

  async getPlayByPlay(tournamentId, gameId) {
    return (await this.#readSnapshot(tournamentId, gameId)).events || [];
  }

  async getProtocol(tournamentId, gameId) {
    return (await this.#readSnapshot(tournamentId, gameId)).protocol || {};
  }

  async getLineups(tournamentId, gameId) {
    return (await this.#readSnapshot(tournamentId, gameId)).lineups || {};
  }

  async listSnapshots(tournamentId, gameId) {
    const manifest = await this.#readManifest(tournamentId, gameId);
    return manifest.snapshots || [];
  }

  async #readSnapshot(tournamentId, gameId) {
    const manifest = await this.#readManifest(tournamentId, gameId);
    const snapshots = manifest.snapshots || [];
    const snapshot = snapshots[this.snapshotIndex ?? snapshots.length - 1];
    return JSON.parse(await fs.readFile(path.join(this.directory.resolveMatchDirectory(tournamentId, gameId), snapshot.file), "utf8"));
  }

  async #readManifest(tournamentId, gameId) {
    return JSON.parse(await fs.readFile(this.directory.resolveManifestPath(tournamentId, gameId), "utf8"));
  }
}
