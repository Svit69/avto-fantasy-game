import { HtmlTextCleaner } from "./HtmlTextCleaner.js";

export class VhlReportStatsParser {
  constructor(cleaner = new HtmlTextCleaner()) { this.cleaner = cleaner; }

  parseRows(html, teamName) {
    const block = this.#extractTeamStatsBlock(html, teamName);
    return ["Вратари", "Защитники", "Нападающие"].flatMap((title) => this.#parseSectionRows(block, title, teamName));
  }

  #extractTeamStatsBlock(html, teamName) {
    const marker = `table-wrap__team-name">${teamName}</h4>`;
    const start = html.lastIndexOf(marker);
    const next = html.indexOf('<h3 class="match-centr-protocol__title">Статистика игроков</h3>', start + 1);
    return start >= 0 ? html.slice(start, next > start ? next : undefined) : "";
  }

  #parseSectionRows(block, title, teamName) {
    const start = block.indexOf(`${title}</h5>`);
    if (start < 0) return [];
    const section = block.slice(start);
    const body = section.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1] || "";
    return [...body.matchAll(/<tr[\s\S]*?<\/tr>/g)].map((row) => this.#parseRow(row[0], title, teamName)).filter(Boolean);
  }

  #parseRow(row, title, teamName) {
    const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(([, cell]) => this.cleaner.stripTags(cell));
    if (!cells[0] || !cells[1]) return null;
    return title === "Вратари" ? this.#createGoalieRow(cells, teamName) : this.#createSkaterRow(cells, title, teamName);
  }

  #createGoalieRow(cells, teamName) {
    return { team: teamName, number: cells[0], name: cells[1], position: "вр", goalsAgainst: this.#num(cells[7]),
      saves: this.#num(cells[8]), assists: this.#num(cells[11]), penalties: Math.ceil(this.#num(cells[13]) / 2) };
  }

  #createSkaterRow(cells, title, teamName) {
    const goals = this.#num(cells[3]);
    return { team: teamName, number: cells[0], name: cells[1], position: title === "Защитники" ? "з" : "н",
      goals, assists: this.#num(cells[4]), penalties: Math.ceil(this.#num(cells[7]) / 2),
      shotsOnGoal: Math.max(this.#num(cells[14]) - goals, 0), hits: this.#num(cells[21]), blockedShots: this.#num(cells[22]) };
  }

  #num(value) { return Number(String(value || "").replace(",", ".").match(/\d+(?:\.\d+)?/)?.[0] || 0); }
}
