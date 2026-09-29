import { LeagueFantasyMultiplierPolicy } from "../src/scoring/LeagueFantasyMultiplierPolicy.js";
import { RussianCountFormatter } from "../src/formatters/RussianCountFormatter.js";
import { FantasyEventPresentationCatalog } from "../src/models/FantasyEventPresentationCatalog.js";
import { KhlFantasyPointValuePolicy } from "./KhlFantasyPointValuePolicy.js";

export class DailyFantasyBreakdownFormatter {
  constructor(pointPolicy = new KhlFantasyPointValuePolicy(), multiplierPolicy = new LeagueFantasyMultiplierPolicy(),
    countFormatter = new RussianCountFormatter(), eventCatalog = new FantasyEventPresentationCatalog()) {
    Object.assign(this, { pointPolicy, multiplierPolicy, countFormatter, eventCatalog });
  }

  formatBreakdown(row) {
    const entries = this.#eventDefinitions().filter(({ key }) => Number(row[key] || 0)).map((definition) => this.#formatEvent(row, definition));
    const rawPoints = entries.reduce((sum, entry) => sum + entry.points, 0);
    const multiplier = this.multiplierPolicy.resolveFantasyPointMultiplier({ league: row.match.league, team: row.player?.team });
    return [...entries.map((entry) => entry.text), `${rawPoints} × ${this.#formatMultiplier(multiplier)} = <b>${row.fantasyPoints} ФО за матч</b>`].join("\n");
  }

  #formatEvent(row, definition) {
    const count = Number(row[definition.key] || 0);
    const value = this.pointPolicy.resolveEventPoints({ position: row.position || row.player?.position }, definition.key);
    const points = count * value;
    return { points, text: `${this.countFormatter.formatCount(count, definition.words)}: ${points >= 0 ? "+" : "−"}${Math.abs(points)}` };
  }

  #formatMultiplier(value) { return String(value).replace(".", ","); }
  #eventDefinitions() { return this.eventCatalog.listDefinitions(); }
}
