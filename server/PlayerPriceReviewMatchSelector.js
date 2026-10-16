import { ImportedMatchCalendarMatcher } from "./ImportedMatchCalendarMatcher.js";
import { ImportedMatchPriorityPolicy } from "./ImportedMatchPriorityPolicy.js";

export class PlayerPriceReviewMatchSelector {
  constructor(matcher = new ImportedMatchCalendarMatcher()) { this.matcher = matcher; }
  selectFinishedMatches(importedMatches, context) {
    const selected = new Map();
    for (const imported of importedMatches) {
      if (Date.parse(imported.scheduledAt) > context.now.getTime()) continue;
      const calendarMatch = this.matcher.findCalendarMatch(imported, context.matches);
      if (!calendarMatch) continue;
      const previous = selected.get(calendarMatch.id);
      if (!previous || new ImportedMatchPriorityPolicy().compare(imported, previous) >= 0) {
        selected.set(calendarMatch.id, { ...imported, scheduledAt: imported.scheduledAt || calendarMatch.startsAt,
          calendarMatchId: calendarMatch.id, tourId: calendarMatch.tourId });
      }
    }
    return [...selected.values()].filter((match) => match.status === "finished");
  }
}
