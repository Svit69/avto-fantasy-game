import { KhlProtocolPlayerMatcher } from "./KhlProtocolPlayerMatcher.js";

export class VhlOnlineFantasyEventFactory {
  constructor(players) { this.matcher = new KhlProtocolPlayerMatcher(players, "ВХЛ"); }

  createRawEvents(rows) {
    return rows.flatMap((row) => {
      const player = this.matcher.findPlayer(row);
      return player ? this.#createPlayerEvents(player, row) : [];
    });
  }

  #createPlayerEvents(player, row) {
    return Object.entries(this.#createEventCounts(row)).flatMap(([eventType, count]) => {
      return Array.from({ length: count }, (_, index) => this.#createEvent(player, row, eventType, index));
    });
  }

  #createEventCounts(row) {
    return { goal: row.goals, assist: row.assists, shotOnGoal: row.shotsOnGoal,
      penalty: row.penalties, blockedShot: row.blockedShots, hit: row.hits };
  }

  #createEvent(player, row, eventType, index) {
    return { id: `${row.team}:${row.number}:${eventType}:${index + 1}`, eventType, playerId: player.id, teamId: row.team, sourceVersion: "vhl-online-html-v1" };
  }
}
