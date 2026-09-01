import { TourSchedulePolicy } from "../src/services/TourSchedulePolicy.js";

export class RosterDeadlineGuard {
  constructor(calendarRepository, tourSchedulePolicy = new TourSchedulePolicy()) {
    Object.assign(this, { calendarRepository, tourSchedulePolicy });
  }

  async canModifyRoster(month) {
    const calendar = await this.calendarRepository.listCalendar();
    const state = this.tourSchedulePolicy.findTourAccessState(calendar, month);
    return state.isOpen && !state.isLocked;
  }
}
