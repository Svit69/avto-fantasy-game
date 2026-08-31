export class PlayerCatalogMerger {
  mergeStoredPlayersWithSeedPlayers(storedPlayers, seedPlayers) {
    const storedPlayersById = new Map(storedPlayers.map((player) => [player.id, player]));
    const seedPlayerIds = new Set(seedPlayers.map((player) => player.id));

    return [
      ...seedPlayers.map((player) => storedPlayersById.get(player.id) || player),
      ...storedPlayers.filter((player) => !seedPlayerIds.has(player.id)),
    ];
  }

  shouldPersistMergedPlayers(storedPlayers, mergedPlayers) {
    const storedPlayerIds = new Set(storedPlayers.map((player) => player.id));
    return mergedPlayers.some((player) => !storedPlayerIds.has(player.id));
  }
}
