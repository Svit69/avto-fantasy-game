import { ImportedMatchCalendarMatcher } from "./ImportedMatchCalendarMatcher.js";

export class PlayerPriceReviewMatchSelector {
  constructor(matcher = new ImportedMatchCalendarMatcher()) { this.matcher = matcher; }
  selectFinishedMatches(importedMatches, context) {
    const selected = new Map();
    for (const imported of importedMatches) {
      if (Date.parse(imported.scheduledAt) > context.now.getTime()) continue;
      const calendarMatch = this.matcher.findCalendarMatch(imported, context.matches);
      if (!calendarMatch) continue;
      const previous = selected.get(calendarMatch.id);
      if (!previous || this.#readImportTime(imported) >= this.#readImportTime(previous)) {
        selected.set(calendarMatch.id, { ...imported, calendarMatchId: calendarMatch.id, tourId: calendarMatch.tourId });
      }
    }
    return [...selected.values()].filter((match) => match.status === "finished");
  }
  #readImportTime(match) { return Date.parse(match.updatedAt || match.lastEventAt || match.createdAt || "") || 0; }
}
