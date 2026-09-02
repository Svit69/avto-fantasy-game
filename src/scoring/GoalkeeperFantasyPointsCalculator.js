import { GoalkeeperFantasyScoringRulebook } from "./GoalkeeperFantasyScoringRulebook.js";
import { LeagueFantasyMultiplierPolicy } from "./LeagueFantasyMultiplierPolicy.js";

export class GoalkeeperFantasyPointsCalculator {
  constructor(rulebook = new GoalkeeperFantasyScoringRulebook(), multiplierPolicy = new LeagueFantasyMultiplierPolicy()) {
    Object.assign(this, { rulebook, multiplierPolicy });
  }

  calculateMatchFantasyPoints({ league, team, events }) {
    const rawPoints = this.rulebook.calculateRawFantasyPoints(events);
    const multiplier = this.multiplierPolicy.resolveFantasyPointMultiplier({ league, team });
    return Math.round(rawPoints * multiplier);
  }
}
