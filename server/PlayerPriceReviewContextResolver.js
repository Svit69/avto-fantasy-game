export class PlayerPriceReviewContextResolver {
  resolveContext(calendar, now = new Date()) {
    const year = now.getUTCFullYear() - (now.getUTCMonth() < 6 ? 1 : 0);
    const seasonStartsAt = Date.UTC(year, 6, 1);
    const tours = (calendar.tours || []).filter((tour) => !tour.id.endsWith("-predseason")
      && Date.parse(tour.startsAt) >= seasonStartsAt && Date.parse(tour.startsAt) <= now.getTime())
      .sort((first, second) => Date.parse(second.startsAt) - Date.parse(first.startsAt));
    const tourIds = new Set(tours.map((tour) => tour.id));
    const matches = (calendar.matches || []).filter((match) => tourIds.has(match.tourId) && Date.parse(match.startsAt) <= now.getTime());
    return { tours, matches, now, season: `${year}/${year + 1}` };
  }
}
