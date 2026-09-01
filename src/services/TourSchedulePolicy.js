export class TourSchedulePolicy {
  buildTourAccessStates(calendar, now = Date.now()) {
    const tours = this.#sortToursByDeadline(calendar.tours);
    return tours.map((tour, index) => this.#createTourAccessState(tour, tours[index - 1], now));
  }

  findTourAccessState(calendar, month, now = Date.now()) {
    return this.buildTourAccessStates(calendar, now).find((state) => state.month === month)
      || this.#createFallbackTourAccessState(month);
  }

  #createTourAccessState(tour, previousTour, now) {
    const deadlineTime = Date.parse(tour.deadlineAt || tour.startsAt);
    const previousDeadlineTime = previousTour ? Date.parse(previousTour.deadlineAt || previousTour.startsAt) : null;
    const isOpen = !previousDeadlineTime || previousDeadlineTime <= now;
    return { ...tour, isOpen, isLocked: Number.isFinite(deadlineTime) && deadlineTime <= now, deadlineTime };
  }

  #sortToursByDeadline(tours) {
    return [...tours].sort((first, second) => {
      return Date.parse(first.deadlineAt || first.startsAt) - Date.parse(second.deadlineAt || second.startsAt);
    });
  }

  #createFallbackTourAccessState(month) {
    return { month, isOpen: false, isLocked: true, deadlineAt: null, deadlineTime: NaN };
  }
}
