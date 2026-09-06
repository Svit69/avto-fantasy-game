export class RosterController {
  constructor({ bodyParser, jsonResponder, profileResolver, rosterRepository, priceLocker, deadlineGuard }) {
    Object.assign(this, { bodyParser, jsonResponder, profileResolver, rosterRepository, priceLocker, deadlineGuard });
  }

  async handleRequest(request, response) {
    if (request.method === "GET") return this.#handleRosterLoad(request, response);
    if (request.method === "POST") return this.#handleRosterSave(request, response);
    return this.jsonResponder.sendJson(response, 405, { error: "method_not_allowed" });
  }

  async #handleRosterLoad(request, response) {
    const profile = await this.profileResolver.resolveProfile(request);
    if (!profile) return this.jsonResponder.sendJson(response, 401, { error: "invalid_init_data" });
    const month = new URL(request.url, `http://${request.headers.host}`).searchParams.get("month") || "Сентябрь";
    const roster = await this.rosterRepository.findRosterByUserAndMonth(profile.id, month);
    return this.jsonResponder.sendJson(response, 200, { ok: true, roster });
  }

  async #handleRosterSave(request, response) {
    const payload = await this.bodyParser.readJson(request);
    const profile = await this.profileResolver.resolveProfile(request, payload);
    if (!profile) return this.jsonResponder.sendJson(response, 401, { error: "invalid_init_data" });
    const month = payload.month || "Сентябрь";
    if (!await this.deadlineGuard.canModifyRoster(month)) return this.jsonResponder.sendJson(response, 423, { error: "tour_started" });
    const currentRoster = await this.rosterRepository.findRosterByUserAndMonth(profile.id, month);
    const slots = await this.priceLocker.lockRosterSlotPrices(payload.slots || [], currentRoster);
    const roster = await this.rosterRepository.saveRoster(profile.id, month, slots);
    return this.jsonResponder.sendJson(response, 200, { ok: true, roster });
  }
}
