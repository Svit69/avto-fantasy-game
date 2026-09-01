export class RosterCompletionPolicy {
  isRosterConfirmed(roster) {
    return Boolean(roster?.slots?.length) && roster.slots.every((slot) => Boolean(slot.playerId));
  }
}
