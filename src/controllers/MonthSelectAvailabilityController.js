export class MonthSelectAvailabilityController {
  constructor(rootElement, calendarApiClient, tourSchedulePolicy) {
    Object.assign(this, { rootElement, calendarApiClient, tourSchedulePolicy });
  }

  async applyAvailableTourOptions() {
    const select = this.rootElement.querySelector(".month-select");
    if (select) select.disabled = true;
    try {
      const calendar = await this.calendarApiClient.loadFantasyCalendar();
      const states = this.tourSchedulePolicy.buildTourAccessStates(calendar);
      this.#syncMonthOptions(new Map(states.map((state) => [state.month, state])));
      if (select) select.disabled = !states.some((state) => state.isOpen);
    } catch (error) { this.#syncMonthOptions(new Map()); throw error; }
  }

  #syncMonthOptions(accessStateByMonth) {
    this.rootElement.querySelectorAll(".month-select option").forEach((option) => {
      const state = accessStateByMonth.get(option.value || option.textContent);
      option.disabled = !state?.isOpen;
      option.dataset.tourState = this.#resolveTourStateName(state);
    });
  }

  #resolveTourStateName(state) {
    if (!state) return "unknown";
    if (!state.isOpen) return "unavailable";
    return state.isLocked ? "locked" : "open";
  }
}
