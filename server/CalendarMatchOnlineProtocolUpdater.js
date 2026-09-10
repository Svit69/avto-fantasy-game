export class CalendarMatchOnlineProtocolUpdater {
  createUpdatedCalendar(calendar, matchId, onlineProtocolId) {
    const match = this.#findMatch(calendar, matchId);
    const updatedMatch = { ...match, onlineProtocolId: String(onlineProtocolId) };
    return { calendar: { ...calendar, matches: this.#replaceMatch(calendar.matches, updatedMatch) }, match: updatedMatch };
  }

  #replaceMatch(matches, updatedMatch) {
    return matches.map((match) => match.id === updatedMatch.id ? updatedMatch : match);
  }

  #findMatch(calendar, matchId) {
    const match = calendar.matches.find((item) => item.id === matchId);
    if (!match) throw new Error("calendar_match_not_found");
    return match;
  }
}
