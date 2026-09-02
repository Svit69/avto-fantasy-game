export class GoalkeeperFantasyScoringRulebook {
  constructor() {
    this.rules = Object.freeze({
      saves: 3,
      goalsAgainst: -15,
      penalties: -10,
      assists: 30,
      goals: 100,
    });
  }

  calculateRawFantasyPoints(events) {
    return Object.entries(this.rules).reduce((sum, [eventName, value]) => {
      return sum + value * this.#getEventCount(events, eventName);
    }, 0);
  }

  #getEventCount(events, eventName) {
    return Number(events?.[eventName] || 0);
  }
}
