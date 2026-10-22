import { ImportedMatchAuthoritySelector } from "./ImportedMatchAuthoritySelector.js";
import { ImportedMatchCalendarMatcher } from "./ImportedMatchCalendarMatcher.js";
import { ImportedMatchPriorityPolicy } from "./ImportedMatchPriorityPolicy.js";

export class MonthlyPlayerStatIndex {
  createIndex(month, calendar, database) {
    const tours = new Set((calendar.tours || []).filter((tour) => tour.month === month).map((tour) => tour.id));
    const scheduled = (calendar.matches || []).filter((match) => tours.has(match.tourId));
    const imports = new ImportedMatchAuthoritySelector().selectAuthoritativeImports(database.matches || [], scheduled);
    const matcher = new ImportedMatchCalendarMatcher(); const priority = new ImportedMatchPriorityPolicy();
    const matches = new Map(imports.map((match) => [match.id, { match, calendarMatch: matcher.findCalendarMatch(match, scheduled) }]));
    const players = new Map();
    for (const stat of database.playerStats || []) {
      const imported = matches.get(stat.matchId);
      if (!imported?.calendarMatch) continue;
      if (!players.has(stat.playerId)) players.set(stat.playerId, new Map());
      const selected = players.get(stat.playerId); const current = selected.get(imported.calendarMatch.id);
      if (priority.compare(imported.match, current?.match) >= 0) selected.set(imported.calendarMatch.id, { ...imported, stat });
    }
    return players;
  }
}
