import { MonthlyPlayerMatchStatSelector } from "./MonthlyPlayerMatchStatSelector.js";

export class DailyRosterTourImpactCalculator {
  constructor(statSelector = new MonthlyPlayerMatchStatSelector()) { this.statSelector = statSelector; }

  calculateImpact({ roster, month, matchDate, calendar, matchDatabase }) {
    const impacts = new Map((roster?.slots || []).map((slot) => {
      const playerId = slot.playerId;
      return [playerId, this.#calculatePlayerImpact(playerId, month, matchDate, calendar, matchDatabase)];
    }));
    return { players: impacts, before: this.#sumAverage(impacts, "before"), after: this.#sumAverage(impacts, "after") };
  }

  #calculatePlayerImpact(playerId, month, matchDate, calendar, matchDatabase) {
    const entries = this.statSelector.selectPlayerMatchStats({ playerId, month, calendar, matchDatabase });
    const before = entries.filter(({ calendarMatch }) => this.#readMatchDate(calendarMatch) < matchDate);
    const after = entries.filter(({ calendarMatch }) => this.#readMatchDate(calendarMatch) <= matchDate);
    return { before: this.#calculateAverage(before), after: this.#calculateAverage(after) };
  }

  #calculateAverage(entries) {
    if (!entries.length) return 0;
    const total = entries.reduce((sum, { stat }) => sum + Number(stat.fantasyPoints || 0), 0);
    return Math.round(total / entries.length);
  }

  #sumAverage(impacts, field) {
    return [...impacts.values()].reduce((sum, impact) => sum + impact[field], 0);
  }

  #readMatchDate(calendarMatch) { return String(calendarMatch?.startsAt || "").slice(0, 10); }
}
