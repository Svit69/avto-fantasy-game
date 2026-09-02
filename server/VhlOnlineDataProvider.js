import { VhlOnlineFantasyEventFactory } from "./VhlOnlineFantasyEventFactory.js";
import { VhlOnlineHtmlDataSource } from "./VhlOnlineHtmlDataSource.js";
import { VhlOnlineMatchDetailsParser } from "./VhlOnlineMatchDetailsParser.js";
import { VhlOnlineStatsRowParser } from "./VhlOnlineStatsRowParser.js";
import { VhlOnlineTeamTabResolver } from "./VhlOnlineTeamTabResolver.js";
import { VhlOnlineUrlResolver } from "./VhlOnlineUrlResolver.js";

export class VhlOnlineDataProvider {
  constructor({ onlineGameId, players, identity = {} }) {
    Object.assign(this, { onlineGameId, players, identity, urlResolver: new VhlOnlineUrlResolver(), htmlSource: new VhlOnlineHtmlDataSource(),
      matchParser: new VhlOnlineMatchDetailsParser(), tabResolver: new VhlOnlineTeamTabResolver(), rowParser: new VhlOnlineStatsRowParser() });
  }

  async getMatch() {
    const html = await this.#loadHtml();
    return { ...this.matchParser.parseMatch(html, { ...this.identity, gameId: this.onlineGameId }), ...this.identity, league: "ВХЛ" };
  }

  async getPlayByPlay() {
    const html = await this.#loadHtml();
    const rows = this.rowParser.parseRows(this.tabResolver.extractTeamBlock(html, "Горняк-УГМК"), "Горняк-УГМК");
    return new VhlOnlineFantasyEventFactory(this.players).createRawEvents(rows);
  }

  async #loadHtml() {
    this.html ||= await this.htmlSource.loadHtml(this.urlResolver.resolveUrl(this.onlineGameId));
    return this.html;
  }
}
