export class RosterJsonNormalizer {
  constructor(defaultMonth = "Сентябрь") {
    this.defaultMonth = defaultMonth;
  }

  normalizeRoster(roster) {
    return {
      ...roster,
      userId: String(roster.userId || roster.id || ""),
      month: roster.month || this.defaultMonth,
      slots: Array.isArray(roster.slots) ? roster.slots : [],
    };
  }

  normalizeRosters(rosters) {
    return rosters.map((roster) => this.normalizeRoster(roster)).filter((roster) => roster.userId);
  }
}
