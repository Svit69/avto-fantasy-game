export class MhkAutoCalendarFactory {
  createMatches(scheduleRows) {
    return scheduleRows.map((scheduleRow) => this.#createMatch(this.#parseScheduleRow(scheduleRow)));
  }

  #parseScheduleRow(scheduleRow) {
    const [month, id, tourId, featuredTeam, opponentTeam, venue, date, time, league, status] = scheduleRow.split("\t");
    return { month, id, tourId, featuredTeam, opponentTeam, venue, date, time, league, status };
  }

  #createMatch(scheduleMatch) {
    const venueForFeaturedTeam = this.#resolveVenueForFeaturedTeam(scheduleMatch.venue);
    return {
      id: scheduleMatch.id,
      tourId: scheduleMatch.tourId,
      startsAt: `${scheduleMatch.date}T${this.#normalizeMoscowTime(scheduleMatch.time)}:00+03:00`,
      sourceTimeZone: "Europe/Moscow",
      featuredTeam: scheduleMatch.featuredTeam,
      homeTeam: venueForFeaturedTeam === "home" ? scheduleMatch.featuredTeam : scheduleMatch.opponentTeam,
      awayTeam: venueForFeaturedTeam === "home" ? scheduleMatch.opponentTeam : scheduleMatch.featuredTeam,
      venueForFeaturedTeam,
      league: scheduleMatch.league,
      status: scheduleMatch.status,
    };
  }

  #resolveVenueForFeaturedTeam(venue) {
    return venue === "Дома" ? "home" : "away";
  }

  #normalizeMoscowTime(time) {
    return time.padStart(5, "0");
  }
}
