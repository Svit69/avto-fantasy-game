import { ROSTER_MODES } from "../models/RosterLifecycle.js";

export class TourDeadlinePolicy {
  resolveRosterMode(savedRoster, calendar, month) {
    if (!savedRoster) return ROSTER_MODES.draft;
    const tour = calendar.tours.find((candidate) => candidate.month === month);
    if (!tour?.deadlineAt) return ROSTER_MODES.confirmed;
    return Date.parse(tour.deadlineAt) <= Date.now() ? ROSTER_MODES.locked : ROSTER_MODES.confirmed;
  }
}
