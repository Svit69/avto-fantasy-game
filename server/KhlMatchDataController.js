export class KhlMatchDataController {
  constructor({ jsonResponder, repository }) { Object.assign(this, { jsonResponder, repository }); }

  async handleRequest(request, response, url) {
    if (request.method !== "GET") return this.jsonResponder.sendJson(response, 405, { error: "method_not_allowed" });
    const route = this.#parseRoute(url.pathname);
    if (!route) return this.jsonResponder.sendJson(response, 404, { error: "not_found" });
    const payload = await this.#loadPayload(route);
    return this.jsonResponder.sendJson(response, payload ? 200 : 404, payload || { error: "khl_match_not_found" });
  }

  #parseRoute(pathname) {
    const match = pathname.match(/^\/api\/khl\/matches\/([^/]+)(?:\/([^/]+))?$/);
    return match ? { gameId: match[1], section: match[2] || "match" } : null;
  }

  async #loadPayload(route) {
    const match = await this.repository.findMatchByGameId(route.gameId);
    if (!match) return null;
    if (route.section === "match") return { ok: true, match };
    if (route.section === "events") return { ok: true, match, events: await this.repository.listEventsByGameId(route.gameId) };
    if (route.section === "player-stats") return { ok: true, match, playerStats: await this.repository.listStatsByGameId(route.gameId) };
    if (route.section === "fantasy-points") return { ok: true, match, pointEntries: await this.repository.listPointEntriesByGameId(route.gameId) };
    return null;
  }
}
