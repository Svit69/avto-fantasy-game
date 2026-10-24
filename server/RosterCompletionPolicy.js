export class RosterCompletionPolicy {
  isRosterConfirmed(roster) {
    return roster?.status !== "editing" && Boolean(roster?.slots?.length) && roster.slots.every((slot) => Boolean(slot.playerId));
  }
}
