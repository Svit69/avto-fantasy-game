export class RosterSlotPriceLocker {
  constructor(playerCatalogRepository) {
    this.playerCatalogRepository = playerCatalogRepository;
  }

  async lockRosterSlotPrices(slotPayloads, currentRoster = null) {
    const players = await this.playerCatalogRepository.listPlayers();
    return slotPayloads.map((slot) => this.#createLockedSlot(slot, players, currentRoster));
  }

  #createLockedSlot(slot, players, currentRoster) {
    const player = players.find((candidate) => candidate.id === slot.playerId);
    if (!player) return { ...slot, lockedPrice: null };
    const lockedPrice = this.#findCurrentLockedPrice(slot, currentRoster) ?? player.price;
    return { slotIndex: slot.slotIndex, position: slot.position, playerId: player.id, lockedPrice };
  }

  #findCurrentLockedPrice(slot, roster) {
    const currentSlot = roster?.slots?.find((candidate) => candidate.slotIndex === slot.slotIndex);
    return currentSlot?.playerId === slot.playerId ? currentSlot.lockedPrice : null;
  }
}
