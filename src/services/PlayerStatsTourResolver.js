export class PlayerStatsTourResolver {
  resolveStatsMonth(calendar, selectedMonth, now = Date.now()) {
    const tours = this.#sortTours(calendar?.tours || []);
    const selectedIndex = tours.findIndex((tour) => tour.month === selectedMonth);
    if (selectedIndex < 0) return selectedMonth;
    const selectedTour = tours[selectedIndex];
    const startsAt = Date.parse(selectedTour.deadlineAt || selectedTour.startsAt);
    if (!Number.isFinite(startsAt) || startsAt <= now) return selectedMonth;
    return tours[selectedIndex - 1]?.month || selectedMonth;
  }

  #sortTours(tours) {
    return [...tours].sort((first, second) =>
      Date.parse(first.deadlineAt || first.startsAt) - Date.parse(second.deadlineAt || second.startsAt));
  }
}
