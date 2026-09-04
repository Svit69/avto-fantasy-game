import { ImportedMatchCalendarMatcher } from "./ImportedMatchCalendarMatcher.js";

export class MonthlyImportedMatchSelector {
  constructor(matchMatcher = new ImportedMatchCalendarMatcher()) {
    this.matchMatcher = matchMatcher;
  }

  selectLatestMonthMatches(month, calendar, importedMatches) {
    const calendarMatches = this.#findMonthCalendarMatches(calendar, month);
    return [...this.#selectLatestByCalendarMatch(calendarMatches, importedMatches).values()];
  }

  #findMonthCalendarMatches(calendar, month) {
    const tourIds = new Set((calendar.tours || []).filter((tour) => tour.month === month).map((tour) => tour.id));
    return (calendar.matches || []).filter((match) => tourIds.has(match.tourId));
  }

  #selectLatestByCalendarMatch(calendarMatches, importedMatches) {
    return importedMatches.reduce((selected, importedMatch) => {
      const calendarMatch = this.matchMatcher.findCalendarMatch(importedMatch, calendarMatches);
      if (!calendarMatch) return selected;
      const current = selected.get(calendarMatch.id);
      return this.#isNewerImport(importedMatch, current) ? selected.set(calendarMatch.id, importedMatch) : selected;
    }, new Map());
  }

  #isNewerImport(candidate, current) {
    if (!current) return true;
    return this.#readImportTime(candidate) >= this.#readImportTime(current);
  }

  #readImportTime(match) {
    return Date.parse(match.updatedAt || match.lastEventAt || match.createdAt || 0) || 0;
  }
}
