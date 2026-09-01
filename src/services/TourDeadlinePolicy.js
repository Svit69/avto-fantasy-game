import { ROSTER_MODES } from "../models/RosterLifecycle.js";
import { TourSchedulePolicy } from "./TourSchedulePolicy.js";

export class TourDeadlinePolicy {
  constructor(tourSchedulePolicy = new TourSchedulePolicy()) { this.tourSchedulePolicy = tourSchedulePolicy; }

  resolveRosterMode(savedRoster, calendar, month) {
    const state = this.resolveTourAccessState(calendar, month);
    if (!state.isOpen || state.isLocked) return ROSTER_MODES.locked;
    if (!savedRoster) return ROSTER_MODES.draft;
    return ROSTER_MODES.confirmed;
  }

  resolveTourAccessState(calendar, month) {
    return this.tourSchedulePolicy.findTourAccessState(calendar, month);
  }
}
