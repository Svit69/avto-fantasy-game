import { DailyFantasyBreakdownFormatter } from "./DailyFantasyBreakdownFormatter.js";

export class DailyPlayerPointsMessageFactory {
  constructor(breakdownFormatter = new DailyFantasyBreakdownFormatter()) { this.breakdownFormatter = breakdownFormatter; }

  createMessage({ playerRows, matches, rosterBefore, rosterAfter }) {
    const rows = playerRows.sort((first, second) => second.fantasyPoints - first.fantasyPoints)
      .map((row) => this.#renderPlayerRow(row)).join("\n\n");
    return `Вчера сыграли ваши хоккеисты:\n\n${rows}\n\nВаш результат в туре: <b>${rosterBefore} → ${rosterAfter} ФО</b>\n${this.#renderMatches(matches)}`;
  }

  #renderPlayerRow(row) {
    const league = row.match.league || row.player?.league || "";
    return `<b>${this.#escape(row.name)}${league ? ` · ${this.#escape(league)}` : ""}</b>\n${this.breakdownFormatter.formatBreakdown(row)}\nСреднее за тур: <b>${row.before} → ${row.after} ФО</b>`;
  }

  #renderMatches(matches) {
    const lines = matches.map((match) => `«${this.#escape(match.homeTeam)}» — «${this.#escape(match.awayTeam)}»`);
    return `${lines.length === 1 ? "Матч" : "Матчи"}: ${lines.join("; ")}`;
  }

  #escape(value) {
    return String(value || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  }
}
