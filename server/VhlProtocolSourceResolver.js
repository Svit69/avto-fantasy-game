import { VhlOnlineUrlResolver } from "./VhlOnlineUrlResolver.js";

export class VhlProtocolSourceResolver {
  constructor(onlineResolver = new VhlOnlineUrlResolver()) { this.onlineResolver = onlineResolver; }

  resolveSource(value) {
    const text = String(value || "").trim();
    if (this.#isReportUrl(text)) return this.#createReportSource(text);
    const gameId = this.onlineResolver.resolveGameId(text);
    return gameId ? { type: "online", gameId, url: this.onlineResolver.resolveUrl(gameId) } : null;
  }

  #isReportUrl(value) {
    return /vhlru\.ru\/report\//i.test(value);
  }

  #createReportSource(url) {
    const gameId = url.match(/[?&]idgame=(\d+)/i)?.[1] || url.match(/(\d{5,})/)?.[1] || "";
    return gameId ? { type: "report", gameId, url } : null;
  }
}
