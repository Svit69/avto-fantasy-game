import { KhlProtocolPlayerMatcher } from "./KhlProtocolPlayerMatcher.js";
import { VhlOnlineFantasyEventFactory } from "./VhlOnlineFantasyEventFactory.js";
import { VhlOnlineHtmlDataSource } from "./VhlOnlineHtmlDataSource.js";
import { VhlReportMatchDetailsParser } from "./VhlReportMatchDetailsParser.js";
import { VhlReportStatsParser } from "./VhlReportStatsParser.js";
import { VhlMatchIdentityGuard } from "./VhlMatchIdentityGuard.js";

export class VhlReportDataProvider {
  constructor({ source, players, identity = {} }) {
    Object.assign(this, { source, players, identity, htmlSource: new VhlOnlineHtmlDataSource(),
      matchParser: new VhlReportMatchDetailsParser(), identityGuard: new VhlMatchIdentityGuard(), statsParser: new VhlReportStatsParser() });
  }

  async getMatch() {
    const html = await this.#loadHtml();
    if (!this.match) {
      const sourceMatch = this.matchParser.parseMatch(html, { gameId: this.source.gameId });
      this.identityGuard.validate(sourceMatch, this.identity.expectedMatch);
      const { expectedMatch, ...identity } = this.identity;
      this.match = { ...sourceMatch, ...identity, league: "ВХЛ" };
    }
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
