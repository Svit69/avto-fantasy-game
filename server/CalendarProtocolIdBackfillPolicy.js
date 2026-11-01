export class CalendarProtocolIdBackfillPolicy {
  mergeRecord(seed, stored) {
    if (!stored) return seed;
    if (stored.onlineProtocolId || !seed.onlineProtocolId || seed.league !== "ВХЛ") return stored;
    const sameTeams = ["id", "league", "featuredTeam", "homeTeam", "awayTeam"].every((field) =>
      typeof seed[field] === "string" && seed[field] && seed[field] === stored[field]);
    const seedStart = Date.parse(seed.startsAt);
    const sameStart = Number.isFinite(seedStart) && seedStart === Date.parse(stored.startsAt);
    return sameTeams && sameStart ? { ...stored, onlineProtocolId: seed.onlineProtocolId } : stored;
  }
}
