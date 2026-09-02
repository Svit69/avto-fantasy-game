export class PlayerCatalogMerger {
  mergeStoredPlayersWithSeedPlayers(storedPlayers, seedPlayers) {
    const storedPlayersById = new Map(storedPlayers.map((player) => [player.id, player]));
    const seedPlayerIds = new Set(seedPlayers.map((player) => player.id));

    return [
      ...seedPlayers.map((player) => this.#mergeStoredPlayer(player, storedPlayersById.get(player.id))),
      ...storedPlayers.filter((player) => !seedPlayerIds.has(player.id)),
    ];
  }

  shouldPersistMergedPlayers(storedPlayers, mergedPlayers) {
    const storedPlayersById = new Map(storedPlayers.map((player) => [player.id, player]));
    return mergedPlayers.some((player) => JSON.stringify(storedPlayersById.get(player.id)) !== JSON.stringify(player));
  }

  #mergeStoredPlayer(seedPlayer, storedPlayer) {
    return storedPlayer ? { ...seedPlayer, ...storedPlayer } : seedPlayer;
  }
}
