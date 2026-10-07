import { VhlOnlineFantasyEventFactory } from "./VhlOnlineFantasyEventFactory.js";
import { VhlOnlineHtmlDataSource } from "./VhlOnlineHtmlDataSource.js";
import { VhlOnlineMatchDetailsParser } from "./VhlOnlineMatchDetailsParser.js";
import { VhlOnlineGoalieStatsParser } from "./VhlOnlineGoalieStatsParser.js";
import { VhlOnlineStatsRowParser } from "./VhlOnlineStatsRowParser.js";
import { VhlOnlineTeamTabResolver } from "./VhlOnlineTeamTabResolver.js";
import { VhlOnlineUrlResolver } from "./VhlOnlineUrlResolver.js";
import { VhlMatchIdentityGuard } from "./VhlMatchIdentityGuard.js";

export class VhlOnlineDataProvider {
  constructor({ onlineGameId, players, identity = {} }) {
    Object.assign(this, { onlineGameId, players, identity, urlResolver: new VhlOnlineUrlResolver(), htmlSource: new VhlOnlineHtmlDataSource(),
      matchParser: new VhlOnlineMatchDetailsParser(), identityGuard: new VhlMatchIdentityGuard(), goalieParser: new VhlOnlineGoalieStatsParser(), tabResolver: new VhlOnlineTeamTabResolver(), rowParser: new VhlOnlineStatsRowParser() });
  }

  async getMatch() {
    const html = await this.#loadHtml();
    if (!this.match) {
      const sourceMatch = this.matchParser.parseMatch(html, { gameId: this.onlineGameId });
      this.identityGuard.validate(sourceMatch, this.identity.expectedMatch);
      const { expectedMatch, ...identity } = this.identity;
      this.match = { ...sourceMatch, ...identity, league: "ВХЛ" };
    }
    return this.match;
  }

  async getPlayByPlay() {
    const html = await this.#loadHtml();
    const match = await this.getMatch();
    const rows = this.rowParser.parseRows(this.tabResolver.extractTeamBlock(html, "Горняк-УГМК"), "Горняк-УГМК");
    const goalieRows = this.goalieParser.parseRows(html, match, "Горняк-УГМК");
    return new VhlOnlineFantasyEventFactory(this.players).createRawEvents([...rows, ...goalieRows]);
  }

  async #loadHtml() {
    this.html ||= await this.htmlSource.loadHtml(this.urlResolver.resolveUrl(this.onlineGameId));
    return this.html;
  }
}
