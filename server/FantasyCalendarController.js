export class FantasyCalendarController {
  constructor({ jsonResponder, calendarRepository }) {
    Object.assign(this, { jsonResponder, calendarRepository });
  }

  async handleRequest(request, response, url) {
    if (request.method !== "GET") return this.jsonResponder.sendJson(response, 405, { error: "method_not_allowed" });
    const calendar = await this.calendarRepository.listCalendar();
    return this.jsonResponder.sendJson(response, 200, this.#filterCalendar(calendar, url.searchParams));
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
}
