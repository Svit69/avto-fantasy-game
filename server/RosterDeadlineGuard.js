export class RosterDeadlineGuard {
  constructor(calendarRepository) { this.calendarRepository = calendarRepository; }

  async canModifyRoster(month) {
    const tours = await this.calendarRepository.listTours();
    const tour = tours.find((candidate) => candidate.month === month);
    if (!tour?.deadlineAt) return true;
    return Date.parse(tour.deadlineAt) > Date.now();
  }
}
