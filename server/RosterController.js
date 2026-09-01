export class RosterController {
  constructor({ bodyParser, jsonResponder, initDataVerifier, rosterRepository, priceLocker }) {
    Object.assign(this, { bodyParser, jsonResponder, initDataVerifier, rosterRepository, priceLocker });
  }

  async handleRequest(request, response) {
    if (request.method === "GET") return this.#handleRosterLoad(request, response);
    if (request.method === "POST") return this.#handleRosterSave(request, response);
    return this.jsonResponder.sendJson(response, 405, { error: "method_not_allowed" });
  }

  async #handleRosterLoad(request, response) {
    const profile = this.#verifyRequestProfile(request.headers["x-telegram-init-data"] || "");
    if (!profile) return this.jsonResponder.sendJson(response, 401, { error: "invalid_init_data" });
    const month = new URL(request.url, `http://${request.headers.host}`).searchParams.get("month") || "Сентябрь";
    const roster = await this.rosterRepository.findRosterByUserAndMonth(profile.id, month);
    return this.jsonResponder.sendJson(response, 200, { ok: true, roster });
  }

  async #handleRosterSave(request, response) {
    if (!this.initDataVerifier.hasToken()) return this.jsonResponder.sendJson(response, 503, { error: "telegram_token_missing" });
    const payload = await this.bodyParser.readJson(request);
    const profile = this.#verifyRequestProfile(payload.initData || "");
    if (!profile) return this.jsonResponder.sendJson(response, 401, { error: "invalid_init_data" });
    const slots = await this.priceLocker.lockRosterSlotPrices(payload.slots || []);
    const roster = await this.rosterRepository.saveRoster(profile.id, payload.month || "Сентябрь", slots);
    return this.jsonResponder.sendJson(response, 200, { ok: true, roster });
  }

  #verifyRequestProfile(initData) {
    if (!this.initDataVerifier.hasToken()) return null;
    const params = new URLSearchParams(initData);
    return this.initDataVerifier.verifyInitData(params) ? JSON.parse(params.get("user") || "{}") : null;
  }
}
