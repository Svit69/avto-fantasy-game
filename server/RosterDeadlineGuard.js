import { TourSchedulePolicy } from "../src/services/TourSchedulePolicy.js";

export class RosterDeadlineGuard {
  constructor(calendarRepository, tourSchedulePolicy = new TourSchedulePolicy()) {
    Object.assign(this, { calendarRepository, tourSchedulePolicy });
  }

  async canModifyRoster(month) {
    const state = await this.findRosterAccessState(month);
    return state.isOpen && !state.isLocked;
  }

  async findRosterAccessState(month) {
    const calendar = await this.calendarRepository.listCalendar();
    return this.tourSchedulePolicy.findTourAccessState(calendar, month);
  }
}
