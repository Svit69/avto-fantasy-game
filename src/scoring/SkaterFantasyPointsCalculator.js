import { LeagueFantasyMultiplierPolicy } from "./LeagueFantasyMultiplierPolicy.js";
import { SkaterFantasyScoringRulebook } from "./SkaterFantasyScoringRulebook.js";

export class SkaterFantasyPointsCalculator {
  constructor(rulebook = new SkaterFantasyScoringRulebook(), multiplierPolicy = new LeagueFantasyMultiplierPolicy()) {
    Object.assign(this, { rulebook, multiplierPolicy });
  }

  calculateMatchFantasyPoints({ position, league, team, events }) {
    const rawPoints = this.rulebook.calculateRawFantasyPoints(position, events);
    const multiplier = this.multiplierPolicy.resolveFantasyPointMultiplier({ league, team });
    return Math.round(rawPoints * multiplier);
  }
}
