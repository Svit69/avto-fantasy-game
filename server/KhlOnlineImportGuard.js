import { ImportedMatchCalendarMatcher } from "./ImportedMatchCalendarMatcher.js";

export class KhlOnlineImportGuard {
  async findProtectedImport(repository, match) {
    if (match.sourceType !== "khl-online") return null;
    const matches = repository.listMatches ? await repository.listMatches() : (await repository.readDatabase()).matches;
    const calendarMatch = { ...match, startsAt: match.scheduledAt, khlGameId: match.gameId };
    return matches.find((stored) => stored.sourceType !== "khl-online" && stored.league === match.league
      && new ImportedMatchCalendarMatcher().findCalendarMatch(stored, [calendarMatch])) || null;
  }
}
