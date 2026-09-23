export class InitialTourSelectionService {
  constructor(calendarApiClient, rosterApiClient, tourSchedulePolicy) {
    Object.assign(this, { calendarApiClient, rosterApiClient, tourSchedulePolicy });
  }

  async applyInitialTourSelection(monthSelect, now = Date.now()) {
    if (!monthSelect) return null;
    const calendar = await this.calendarApiClient.loadFantasyCalendar();
    const states = this.tourSchedulePolicy.buildTourAccessStates(calendar, now);
    const activeTour = states.find((tour) => this.#isTourActive(tour, now));
    const activeRoster = activeTour ? await this.#loadSavedRoster(activeTour.month) : null;
    const target = this.#resolveTargetTour(states, activeTour, activeRoster, now);
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
    return roster?.slots?.length === 6 && roster.slots.every((slot) => Boolean(slot.playerId));
  }

  async #loadSavedRoster(month) {
    try { return await this.rosterApiClient.loadSavedRoster(month); } catch { return null; }
  }
}
