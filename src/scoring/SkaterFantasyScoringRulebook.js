import { ROSTER_POSITIONS } from "../data/positions.js";

export class SkaterFantasyScoringRulebook {
  constructor() {
    this.rules = Object.freeze({
      [ROSTER_POSITIONS.forward]: this.#createForwardRules(),
      [ROSTER_POSITIONS.defender]: this.#createDefenderRules(),
    });
  }

  calculateRawFantasyPoints(position, events) {
    const positionRules = this.rules[position];
    if (!positionRules) return 0;
    return Object.entries(positionRules).reduce((sum, [eventName, value]) => {
      return sum + value * this.#getEventCount(events, eventName);
    }, 0);
  }

  #createForwardRules() {
    return { goals: 50, assists: 30, penalties: -10, shotsOnGoal: 5, hits: 5, takeaways: 10, interceptions: 10 };
  }

  #createDefenderRules() {
    return { goals: 60, assists: 40, penalties: -10, shotsOnGoal: 5, hits: 5, takeaways: 10, interceptions: 10 };
  }

  #getEventCount(events, eventName) {
    return Number(events?.[eventName] || 0);
  }
}
