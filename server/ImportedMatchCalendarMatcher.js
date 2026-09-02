export class ImportedMatchCalendarMatcher {
  findCalendarMatch(importedMatch, calendarMatches) {
    return calendarMatches.find((calendarMatch) => this.#isSameMatch(importedMatch, calendarMatch)) || null;
  }

  #isSameMatch(importedMatch, calendarMatch) {
    return importedMatch.tournamentId === calendarMatch.tourId || importedMatch.league === calendarMatch.league
      && this.#isSameDate(importedMatch.scheduledAt, calendarMatch.startsAt)
      && this.#hasSameTeams(importedMatch, calendarMatch);
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
