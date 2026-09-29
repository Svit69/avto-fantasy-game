import { LeagueFantasyMultiplierPolicy } from "../src/scoring/LeagueFantasyMultiplierPolicy.js";
import { KhlFantasyPointValuePolicy } from "./KhlFantasyPointValuePolicy.js";

export class DailyFantasyBreakdownFormatter {
  constructor(pointPolicy = new KhlFantasyPointValuePolicy(), multiplierPolicy = new LeagueFantasyMultiplierPolicy()) {
    Object.assign(this, { pointPolicy, multiplierPolicy });
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
    return { points, text: `${count} ${this.#selectWord(count, definition.words)}: ${points >= 0 ? "+" : "−"}${Math.abs(points)}` };
  }

  #selectWord(count, [one, few, many]) {
    const value = Math.abs(count) % 100; const last = value % 10;
    if (value > 10 && value < 20) return many;
    if (last === 1) return one;
    return last >= 2 && last <= 4 ? few : many;
  }

  #formatMultiplier(value) { return String(value).replace(".", ","); }
  #eventDefinitions() {
    return [{ key: "goals", words: ["гол", "гола", "голов"] }, { key: "assists", words: ["передача", "передачи", "передач"] },
      { key: "shotsOnGoal", words: ["бросок в створ", "броска в створ", "бросков в створ"] }, { key: "blockedShots", words: ["блокированный бросок", "блокированных броска", "блокированных бросков"] },
      { key: "hits", words: ["силовой приём", "силовых приёма", "силовых приёмов"] }, { key: "takeaways", words: ["отбор", "отбора", "отборов"] },
      { key: "interceptions", words: ["перехват", "перехвата", "перехватов"] }, { key: "saves", words: ["сейв", "сейва", "сейвов"] },
      { key: "goalsAgainst", words: ["пропущенный гол", "пропущенных гола", "пропущенных голов"] }, { key: "penalties", words: ["минута штрафа", "минуты штрафа", "минут штрафа"] }];
  }
}
