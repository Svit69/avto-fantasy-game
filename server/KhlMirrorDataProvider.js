import { KhlPayloadDataProvider } from "./KhlPayloadDataProvider.js";
import { KhlMirrorDataSource } from "./KhlMirrorDataSource.js";
import { KhlOnlineMatchParser } from "./KhlOnlineMatchParser.js";
import { KhlOnlineSkaterParser } from "./KhlOnlineSkaterParser.js";
import { KhlOnlineGoalieParser } from "./KhlOnlineGoalieParser.js";
import { KhlOnlinePlayerMatcher } from "./KhlOnlinePlayerMatcher.js";
import { KhlProtocolFantasyEventFactory } from "./KhlProtocolFantasyEventFactory.js";
import { KhlOnlineStatisticsValidator } from "./KhlOnlineStatisticsValidator.js";

export class KhlMirrorDataProvider extends KhlPayloadDataProvider {
  #loaded;
  constructor({ gameId, players, expectedMatch = null, dataSource = new KhlMirrorDataSource() }) {
    super({}); Object.assign(this, { gameId, players, expectedMatch, dataSource, unmatchedPlayers: [] });
  }
  async getMatch() { await this.#loadPayload(); return super.getMatch(); }
  async getPlayByPlay() { await this.#loadPayload(); return super.getPlayByPlay(); }
  async #loadPayload() {
    this.#loaded ||= this.#buildPayload();
    await this.#loaded;
  }
  async #buildPayload() {
    const game = await this.dataSource.loadGame(this.gameId);
    const match = new KhlOnlineMatchParser().parseMatch(game, this.expectedMatch);
    this.payload = { match, events: [] };
    if (match.status === "scheduled") return;
    const side = match.homeTeam === "Автомобилист" ? "A" : "B";
    const skaters = new KhlOnlineSkaterParser().parseRows(game, side);
    new KhlOnlineStatisticsValidator().validateSkaterTotals(game, side, skaters);
    const rows = [...skaters, ...new KhlOnlineGoalieParser().parseRows(game, side)]
      .filter((row) => row.appearances > 0);
    const matcher = new KhlOnlinePlayerMatcher(this.players);
    this.unmatchedPlayers = rows.filter((row) => !matcher.findPlayer(row)).map((row) => row.name);
    this.payload.events = new KhlProtocolFantasyEventFactory().createRawEvents(rows, matcher)
      .map((event) => ({ ...event, sourceVersion: "khl-mirror-online-v1" }));
    if (!this.payload.events.length) throw new Error("khl_online_no_matched_players");
    this.rows = rows;
  }
}
