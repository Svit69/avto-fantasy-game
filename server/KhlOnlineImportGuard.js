import { ImportedMatchCalendarMatcher } from "./ImportedMatchCalendarMatcher.js";
import { OnlineMatchSourcePolicy } from "./OnlineMatchSourcePolicy.js";

export class KhlOnlineImportGuard {
  async findProtectedImport(repository, match) {
    const policy = new OnlineMatchSourcePolicy();
    if (!policy.isOnline(match)) return null;
    const matches = repository.listMatches ? await repository.listMatches() : (await repository.readDatabase()).matches;
    const calendarMatch = { ...match, startsAt: match.scheduledAt };
    return matches.find((stored) => !policy.isOnline(stored) && stored.league === match.league
      && new ImportedMatchCalendarMatcher().findCalendarMatch(stored, [calendarMatch])) || null;
  }
}
