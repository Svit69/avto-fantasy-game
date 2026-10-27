export class InitialTourSelectionService {
  constructor(calendarApiClient, rosterApiClient, tourSchedulePolicy) {
    Object.assign(this, { calendarApiClient, rosterApiClient, tourSchedulePolicy });
  }

  async applyInitialTourSelection(monthSelect, now = Date.now()) {
    if (!monthSelect) return null;
    const calendar = await this.calendarApiClient.loadFantasyCalendar();
    const states = this.tourSchedulePolicy.buildTourAccessStates(calendar, now);
    if (!states.some((state) => state.isOpen)) throw new Error("calendar_has_no_available_tours");
    const requestedMonth = new URLSearchParams(globalThis.window?.location?.search || "").get("roster_month");
    const requestedTour = states.find((tour) => tour.month === requestedMonth && tour.isOpen && !tour.isLocked);
    const activeTour = states.find((tour) => this.#isTourActive(tour, now));
    const activeRoster = activeTour ? await this.#loadSavedRoster(activeTour.month) : null;
    const target = requestedTour || this.#resolveTargetTour(states, activeTour, activeRoster, now);
    if (target && [...monthSelect.options].some((option) => option.value === target.month)) monthSelect.value = target.month;
    return target;
  }

  #resolveTargetTour(states, activeTour, activeRoster, now) {
    if (activeTour && !this.#isRosterComplete(activeRoster)) {
      return states.find((tour) => tour.deadlineTime > now && tour.isOpen && !tour.isLocked) || activeTour;
    }
    if (activeTour) return activeTour;
    return states.find((tour) => tour.deadlineTime > now && tour.isOpen && !tour.isLocked)
      || [...states].reverse().find((tour) => tour.deadlineTime <= now) || states[0] || null;
  }

  #isTourActive(tour, now) {
    const endsAt = Date.parse(tour.endsAt || tour.deadlineAt);
    return tour.deadlineTime <= now && (!Number.isFinite(endsAt) || now <= endsAt);
  }

  #isRosterComplete(roster) {
    return roster?.status !== "editing" && roster?.slots?.length === 6 && roster.slots.every((slot) => Boolean(slot.playerId));
  }

  async #loadSavedRoster(month) {
    return this.rosterApiClient.loadSavedRoster(month);
  }
}
