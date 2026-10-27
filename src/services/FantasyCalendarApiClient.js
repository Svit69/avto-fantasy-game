import { CapacityAwareApiRequest } from "./CapacityAwareApiRequest.js";
import { FantasyCalendarPayloadValidator } from "./FantasyCalendarPayloadValidator.js";
export class FantasyCalendarApiClient {
  static cache = null;
  static ttlMs = 60 * 1000;

  async loadFantasyCalendar() {
    if (this.#hasFreshCache()) return FantasyCalendarApiClient.cache.promise;
    const entry = { expiresAt: Infinity };
    FantasyCalendarApiClient.cache = entry;
    entry.promise = this.#fetchFantasyCalendar().then((calendar) => {
      entry.expiresAt = Date.now() + FantasyCalendarApiClient.ttlMs; return calendar;
    }).catch((error) => {
      if (FantasyCalendarApiClient.cache === entry) FantasyCalendarApiClient.cache = null;
      throw error;
    });
    return entry.promise;
  }

  #hasFreshCache() {
    return FantasyCalendarApiClient.cache?.expiresAt > Date.now();
  }

  async #fetchFantasyCalendar() {
    const response = await new CapacityAwareApiRequest().fetchResponse(`/api/calendar?stamp=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw Object.assign(new Error("calendar_load_failed"), { statusCode: response.status });
    return new FantasyCalendarPayloadValidator().validatePayload(await response.json());
  }
}
