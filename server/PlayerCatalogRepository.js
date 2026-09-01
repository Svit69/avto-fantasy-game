import fs from "node:fs/promises";
import path from "node:path";
import { PlayerCatalogMerger } from "./PlayerCatalogMerger.js";

export class PlayerCatalogRepository {
  constructor(filePath, seedPlayers, teamBrandResolver) {
    Object.assign(this, { filePath, seedPlayers, teamBrandResolver, merger: new PlayerCatalogMerger() });
  }

  async listPlayers() {
    const storedPlayers = await this.#readStoredPlayers();
    const players = this.merger.mergeStoredPlayersWithSeedPlayers(storedPlayers, this.seedPlayers);
    if (this.merger.shouldPersistMergedPlayers(storedPlayers, players)) await this.#writePlayers(players);
    return players;
  }

  async findPlayerById(playerId) {
    return (await this.listPlayers()).find((player) => player.id === playerId) || null;
  }

  async updatePlayerPrice(playerId, price) {
    return this.#updatePlayer(playerId, (player) => ({ ...player, price }));
  }

  async updatePlayerTeam(playerId, team) {
    return this.#updatePlayer(playerId, (player) => ({ ...player, team, ...this.teamBrandResolver.resolveTeamAssets(team) }));
  }

  async markPlayerLeftGame(playerId) {
    return this.#updatePlayer(playerId, (player) => ({ ...player, status: "left_game" }));
  }

  async #updatePlayer(playerId, updatePlayer) {
    const players = await this.listPlayers();
    const nextPlayers = players.map((player) => player.id === playerId ? updatePlayer(player) : player);
    await this.#writePlayers(nextPlayers);
    return nextPlayers.find((player) => player.id === playerId) || null;
  }

  async #readStoredPlayers() {
    try {
      const payload = JSON.parse(await fs.readFile(this.filePath, "utf8"));
      return Array.isArray(payload.players) ? payload.players : [];
    } catch {
      return [];
    }
  }

  async #writePlayers(players) {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify({ players }, null, 2), "utf8");
  }
}
