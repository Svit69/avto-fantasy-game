import { ImportedMatchCalendarMatcher } from "./ImportedMatchCalendarMatcher.js";

export class ImportedMatchAuthoritySelector {
  selectAuthoritativeImports(imports, calendarMatches) {
    const matcher = new ImportedMatchCalendarMatcher();
    const protectedIds = new Set(imports.filter((match) => match.sourceType !== "khl-online")
      .map((match) => matcher.findCalendarMatch(match, calendarMatches)?.id).filter(Boolean));
    return imports.filter((match) => match.sourceType !== "khl-online"
      || !protectedIds.has(matcher.findCalendarMatch(match, calendarMatches)?.id));
  }
}
