export class FantasyCalendarApiClient {
  async loadFantasyCalendar() {
    try {
      const response = await fetch(`/api/calendar?stamp=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) return this.#createEmptyCalendar();
      const payload = await response.json();
      return this.#normalizeCalendarPayload(payload);
    } catch {
      return this.#createEmptyCalendar();
    }
  }

  #normalizeCalendarPayload(payload) {
    return {
      tours: Array.isArray(payload.tours) ? payload.tours : [],
      matches: Array.isArray(payload.matches) ? payload.matches : [],
      opponents: Array.isArray(payload.opponents) ? payload.opponents : [],
    };
  }

  #createEmptyCalendar() {
    return { tours: [], matches: [], opponents: [] };
  }
}
