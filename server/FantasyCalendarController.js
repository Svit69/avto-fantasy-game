export class FantasyCalendarController {
  constructor({ jsonResponder, calendarRepository, opponentTeamRepository }) {
    Object.assign(this, { jsonResponder, calendarRepository, opponentTeamRepository });
  }

  async handleRequest(request, response, url) {
    if (request.method !== "GET") return this.jsonResponder.sendJson(response, 405, { error: "method_not_allowed" });
    const calendar = await this.calendarRepository.listCalendar();
    const opponents = await this.opponentTeamRepository.listTeams();
    const filteredCalendar = this.#filterCalendar(calendar, url.searchParams);
    return this.jsonResponder.sendJson(response, 200, { ...this.#addTeamDetails(filteredCalendar, opponents), opponents });
  }

  #filterCalendar(calendar, searchParams) {
    const month = searchParams.get("month");
    const tourId = searchParams.get("tourId");
    const tours = calendar.tours.filter((tour) => this.#matchesTourFilter(tour, { month, tourId }));
    const tourIds = new Set(tours.map((tour) => tour.id));
    return { tours, matches: calendar.matches.filter((match) => tourIds.has(match.tourId)) };
  }

  #matchesTourFilter(tour, filter) {
    return (!filter.month || tour.month === filter.month) && (!filter.tourId || tour.id === filter.tourId);
  }

  #addTeamDetails(calendar, opponents) {
    const opponentByName = new Map(opponents.map((opponent) => [opponent.name, opponent]));
    const matches = calendar.matches.map((match) => ({ ...match, homeTeamDetails: opponentByName.get(match.homeTeam) || null, awayTeamDetails: opponentByName.get(match.awayTeam) || null }));
    return { ...calendar, matches };
  }
}
