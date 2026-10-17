import { ImportedMatchCalendarMatcher } from "./ImportedMatchCalendarMatcher.js";
import { OnlineMatchSourcePolicy } from "./OnlineMatchSourcePolicy.js";

export class ImportedMatchAuthoritySelector {
  selectAuthoritativeImports(imports, calendarMatches) {
    const matcher = new ImportedMatchCalendarMatcher();
    const policy = new OnlineMatchSourcePolicy();
    const protectedIds = new Set(imports.filter((match) => !policy.isOnline(match))
      .map((match) => matcher.findCalendarMatch(match, calendarMatches)?.id).filter(Boolean));
    return imports.filter((match) => !policy.isOnline(match)
      || !protectedIds.has(matcher.findCalendarMatch(match, calendarMatches)?.id));
  }
}
