import { GoalkeeperFantasyPointsCalculator } from "../src/scoring/GoalkeeperFantasyPointsCalculator.js";
import { SkaterFantasyPointsCalculator } from "../src/scoring/SkaterFantasyPointsCalculator.js";

export class KhlPlayerStatsAggregator {
  constructor(skaterCalculator = new SkaterFantasyPointsCalculator(), goalieCalculator = new GoalkeeperFantasyPointsCalculator()) {
    Object.assign(this, { skaterCalculator, goalieCalculator });
  }

  createPlayerMatchStats(match, entries, playersById) {
    const grouped = this.#groupEntriesByPlayer(entries);
    return Object.entries(grouped).map(([playerId, events]) => this.#createPlayerStats(match, playersById[playerId], events));
  }

  #groupEntriesByPlayer(entries) {
    return entries.reduce((grouped, entry) => ({ ...grouped, [entry.playerId]: [...(grouped[entry.playerId] || []), entry] }), {});
  }

  #createPlayerStats(match, player, entries) {
    const events = this.#countEvents(entries); const position = player?.position || null;
    const fantasyPoints = position === "вратарь"
      ? this.goalieCalculator.calculateMatchFantasyPoints({ league: match.league, team: player.team, events })
      : this.skaterCalculator.calculateMatchFantasyPoints({ position, league: match.league, team: player?.team, events });
    return { matchId: match.id, playerId: player.id, position, ...events, fantasyPoints, isVerified: false, updatedAt: new Date().toISOString() };
  }

  #countEvents(entries) {
    return entries.reduce((events, entry) => ({ ...events, [entry.eventType]: Number(events[entry.eventType] || 0) + 1 }), {});
  }
}
