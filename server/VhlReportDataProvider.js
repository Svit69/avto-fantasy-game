import { KhlProtocolPlayerMatcher } from "./KhlProtocolPlayerMatcher.js";
import { VhlOnlineFantasyEventFactory } from "./VhlOnlineFantasyEventFactory.js";
import { VhlOnlineHtmlDataSource } from "./VhlOnlineHtmlDataSource.js";
import { VhlReportMatchDetailsParser } from "./VhlReportMatchDetailsParser.js";
import { VhlReportStatsParser } from "./VhlReportStatsParser.js";

export class VhlReportDataProvider {
  constructor({ source, players, identity = {} }) {
    Object.assign(this, { source, players, identity, htmlSource: new VhlOnlineHtmlDataSource(),
      matchParser: new VhlReportMatchDetailsParser(), statsParser: new VhlReportStatsParser() });
  }

  async getMatch() {
    const html = await this.#loadHtml();
    this.match ||= { ...this.matchParser.parseMatch(html, { ...this.identity, gameId: this.source.gameId }), ...this.identity, league: "ВХЛ" };
    return this.match;
  }

  async getPlayByPlay() {
    const html = await this.#loadHtml();
    const rows = this.statsParser.parseRows(html, "Горняк-УГМК");
    const eventFactory = new VhlOnlineFantasyEventFactory(this.players, "vhl-report-html-v1");
    return eventFactory.createRawEvents(rows, new KhlProtocolPlayerMatcher(this.players, "ВХЛ"));
  }

  async #loadHtml() {
    this.html ||= await this.htmlSource.loadHtml(this.source.url);
    return this.html;
  }
}
