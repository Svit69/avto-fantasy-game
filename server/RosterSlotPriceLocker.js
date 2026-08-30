export class RosterSlotPriceLocker {
  constructor(playerCatalogRepository) {
    this.playerCatalogRepository = playerCatalogRepository;
  }

  async lockRosterSlotPrices(slotPayloads) {
    const players = await this.playerCatalogRepository.listPlayers();
    return slotPayloads.map((slot) => this.#createLockedSlot(slot, players));
  }

  #createLockedSlot(slot, players) {
    const player = players.find((candidate) => candidate.id === slot.playerId);
    if (!player) return { ...slot, lockedPrice: null };
    return { slotIndex: slot.slotIndex, position: slot.position, playerId: player.id, lockedPrice: player.price };
  }
}
