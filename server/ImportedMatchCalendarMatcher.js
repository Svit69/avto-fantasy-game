export class ImportedMatchCalendarMatcher {
  findCalendarMatch(importedMatch, calendarMatches) {
    return calendarMatches.find((calendarMatch) => this.#isSameMatch(importedMatch, calendarMatch)) || null;
  }

  #isSameMatch(importedMatch, calendarMatch) {
    return this.#hasSameExternalId(importedMatch, calendarMatch) || this.#hasSameMatchScope(importedMatch, calendarMatch)
      && this.#isSameDate(importedMatch.scheduledAt, calendarMatch.startsAt)
      && this.#hasSameTeams(importedMatch, calendarMatch);
  }

  #hasSameMatchScope(importedMatch, calendarMatch) {
    return importedMatch.tournamentId === calendarMatch.tourId || importedMatch.league === calendarMatch.league;
  }

  #hasSameExternalId(importedMatch, calendarMatch) {
    const importedGameId = String(importedMatch.gameId || "");
    const calendarIds = [calendarMatch.khlGameId, calendarMatch.onlineProtocolId, calendarMatch.gameId].map((id) => String(id || ""));
    return importedGameId && calendarIds.includes(importedGameId);
  }

  #isSameDate(firstDate, secondDate) {
    return String(firstDate || "").slice(0, 10) === String(secondDate || "").slice(0, 10);
  }

  #hasSameTeams(importedMatch, calendarMatch) {
    const importedTeams = this.#createTeamKey(importedMatch.homeTeam, importedMatch.awayTeam);
    const calendarTeams = this.#createTeamKey(calendarMatch.homeTeam, calendarMatch.awayTeam);
    return importedTeams === calendarTeams;
  }

  #createTeamKey(homeTeam, awayTeam) {
    return [homeTeam, awayTeam].map((team) => String(team || "").trim()).sort().join("|");
  }
}
