export class TourEffectiveDeadlineResolver {
  resolveTours(calendar) {
    return (calendar.tours || []).map((tour) => {
      const configured = Date.parse(tour.deadlineAt || tour.startsAt);
      if (!Number.isFinite(configured)) return tour;
      const matches = (calendar.matches || []).filter((match) => match.tourId === tour.id && !["cancelled", "canceled"].includes(match.status));
      const observed = matches.flatMap((match) => [Date.parse(match.startsAt), Date.parse(match.observedStartedAt), Date.parse(match.observedDeadlineAt)]).filter(Number.isFinite);
      const deadline = Math.min(configured, ...observed);
      if (deadline === configured) return tour;
      return { ...tour, deadlineAt: new Date(deadline).toISOString(),
        startsAt: new Date(Math.min(Date.parse(tour.startsAt) || deadline, deadline)).toISOString() };
    });
  }
}
