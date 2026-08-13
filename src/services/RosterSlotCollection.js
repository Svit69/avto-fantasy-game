export class RosterSlotCollection {
  static canAddPlayer(slots, player) {
    return !this.hasPlayer(slots, player) && !this.isPositionFull(slots, player.getPosition());
  }

  static hasPlayer(slots, player) {
    return slots.some((slot) => slot.getPlayer()?.getId() === player.getId());
  }

  static isPositionFull(slots, position) {
    const positionSlots = slots.filter((slot) => slot.getPosition() === position);

    return positionSlots.every((slot) => slot.isFilled());
  }

  static addPlayerToFirstAvailableSlot(slots, player) {
    let wasAssigned = false;

    return slots.map((slot) => {
      if (wasAssigned || slot.isFilled() || slot.getPosition() !== player.getPosition()) {
        return slot;
      }

      wasAssigned = true;
      return slot.assignPlayer(player);
    });
  }

  static removePlayerById(slots, playerId) {
    return slots.map((slot) => {
      return slot.getPlayer()?.getId() === playerId ? slot.clearPlayer() : slot;
    });
  }
}
