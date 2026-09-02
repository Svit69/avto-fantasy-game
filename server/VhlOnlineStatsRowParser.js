import { HtmlTextCleaner } from "./HtmlTextCleaner.js";

export class VhlOnlineStatsRowParser {
  constructor(cleaner = new HtmlTextCleaner()) { this.cleaner = cleaner; }

  parseRows(teamBlock, teamName) {
    const body = teamBlock.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1] || "";
    return this.#parseBody(body, teamName);
  }

  #parseBody(body, teamName) {
    return [...body.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(([, row]) => this.#parseRow(row, teamName)).filter(Boolean);
  }

  #parseRow(row, teamName) {
    const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(([, cell]) => this.cleaner.stripTags(cell));
    const identity = cells[1]?.match(/^(.+?)\((н|з|вр)\)$/u);
    if (cells.length < 12 || !identity) return null;
    return { team: teamName, number: cells[0], name: identity[1], position: identity[2],
      goals: this.#toNumber(cells[2]), assists: this.#toNumber(cells[3]), shotsOnGoal: Math.max(this.#toNumber(cells[5]) - this.#toNumber(cells[2]), 0),
      penalties: Math.ceil(this.#toNumber(cells[6]) / 2), blockedShots: this.#toNumber(cells[10]), hits: this.#toNumber(cells[11]) };
  }

  #toNumber(value) {
    return Number(String(value || "").replace(",", ".").match(/\d+(?:\.\d+)?/)?.[0] || 0);
  }
}
