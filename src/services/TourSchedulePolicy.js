export class TourSchedulePolicy {
  buildTourAccessStates(calendar, now = Date.now()) {
    const tours = this.#sortToursByDeadline(calendar.tours);
    const valid = Number.isFinite(now) && tours.every((tour) => Number.isFinite(Date.parse(tour.deadlineAt || tour.startsAt)));
    return tours.map((tour, index) => valid ? this.#createTourAccessState(tour, tours[index - 1], now)
      : { ...tour, isOpen: false, isLocked: true, deadlineTime: NaN });
  }

  findTourAccessState(calendar, month, now = Date.now()) {
    return this.buildTourAccessStates(calendar, now).find((state) => state.month === month)
      || this.#createFallbackTourAccessState(month);
  }

  #createTourAccessState(tour, previousTour, now) {
    const deadlineTime = Date.parse(tour.deadlineAt || tour.startsAt);
    const previousDeadlineTime = previousTour ? Date.parse(previousTour.deadlineAt || previousTour.startsAt) : null;
    const isOpen = Number.isFinite(deadlineTime) && (!previousTour || previousDeadlineTime <= now);
    return { ...tour, isOpen, isLocked: Number.isFinite(deadlineTime) && deadlineTime <= now, deadlineTime };
  }

  #sortToursByDeadline(tours) {
    return [...(Array.isArray(tours) ? tours : [])].sort((first, second) => {
      return Date.parse(first.deadlineAt || first.startsAt) - Date.parse(second.deadlineAt || second.startsAt);
    });
  }

  #createFallbackTourAccessState(month) {
    return { month, isOpen: false, isLocked: true, deadlineAt: null, deadlineTime: NaN };
  }
}
