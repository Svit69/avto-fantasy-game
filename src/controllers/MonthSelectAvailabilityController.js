export class MonthSelectAvailabilityController {
  constructor(rootElement, calendarApiClient, tourSchedulePolicy) {
    Object.assign(this, { rootElement, calendarApiClient, tourSchedulePolicy });
  }

  async applyAvailableTourOptions() {
    const calendar = await this.calendarApiClient.loadFantasyCalendar();
    const accessStates = this.tourSchedulePolicy.buildTourAccessStates(calendar);
    this.#syncMonthOptions(new Map(accessStates.map((state) => [state.month, state])));
  }

  #syncMonthOptions(accessStateByMonth) {
    this.rootElement.querySelectorAll(".month-select option").forEach((option) => {
      const state = accessStateByMonth.get(option.value || option.textContent);
      option.disabled = Boolean(state && !state.isOpen);
      option.dataset.tourState = this.#resolveTourStateName(state);
    });
  }

  #resolveTourStateName(state) {
    if (!state) return "unknown";
    if (!state.isOpen) return "unavailable";
    return state.isLocked ? "locked" : "open";
  }
}
