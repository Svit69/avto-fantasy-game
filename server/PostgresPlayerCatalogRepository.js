import { PlayerCatalogMerger } from "./PlayerCatalogMerger.js";
import { PlayerTeamHistoryService } from "./PlayerTeamHistoryService.js";
import { PostgresSingleKeyJsonRepository } from "./PostgresSingleKeyJsonRepository.js";

export class PostgresPlayerCatalogRepository {
  constructor(database, seedPlayers, teamBrandResolver) {
    Object.assign(this, { teamBrandResolver, seedPlayers, records: new PostgresSingleKeyJsonRepository(database, "players"),
      merger: new PlayerCatalogMerger(), teamHistoryService: new PlayerTeamHistoryService() });
  }

  async listPlayers() {
    const stored = await this.records.listRecords();
    const players = this.merger.mergeStoredPlayersWithSeedPlayers(stored, this.seedPlayers);
    if (this.merger.shouldPersistMergedPlayers(stored, players)) await Promise.all(players.map((player) => this.#savePlayer(player)));
    return players;
  }

  async findPlayerById(playerId) { return (await this.listPlayers()).find((player) => player.id === playerId) || null; }
  async updatePlayerPrice(playerId, price) { return this.#updatePlayer(playerId, (player) => ({ ...player, price })); }
  async updatePlayerTeam(playerId, team) { return this.#updatePlayer(playerId, (player) => this.#createTransferredPlayer(player, team)); }
  async markPlayerLeftGame(playerId) { return this.#updatePlayer(playerId, (player) => ({ ...player, status: "left_game" })); }

  async #updatePlayer(playerId, updatePlayer) {
    const player = await this.findPlayerById(playerId);
    if (!player) return null;
    const nextPlayer = updatePlayer(player);
    await this.#savePlayer(nextPlayer);
    return nextPlayer;
  }

  #createTransferredPlayer(player, team) {
    return this.teamHistoryService.createPlayerWithTransferredTeam(player, team, this.teamBrandResolver.resolveTeamAssets(team));
  }

  #savePlayer(player) { return this.records.upsertRecord(player.id, player); }
}
