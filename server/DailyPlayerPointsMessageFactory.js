export class DailyPlayerPointsMessageFactory {
  createMessage({ managerName, matchDate, playerRows, matches }) {
    const rows = playerRows.sort((a, b) => b.fantasyPoints - a.fantasyPoints).map((row) => this.#renderPlayerRow(row)).join("\n");
    const total = playerRows.reduce((sum, row) => sum + row.fantasyPoints, 0);
    return `Доброе утро, ${managerName || "менеджер"}!\n\nЗа матчи ${this.#formatDate(matchDate)} ваши хоккеисты набрали очки:\n\n${rows}\n\nИтого за день: ${total > 0 ? "+" : ""}${total} ФО.\nМатчи: ${matches.map((match) => `${match.homeTeam} - ${match.awayTeam}`).join("; ")}`;
  }

  #renderPlayerRow(row) {
    return `${row.name}: ${row.fantasyPoints > 0 ? "+" : ""}${row.fantasyPoints} ФО (${this.#renderStats(row)})`;
  }

  #renderStats(row) {
    const labels = [["goals", "гол"], ["assists", "пас"], ["shotsOnGoal", "бс."], ["blockedShots", "блок"], ["hits", "сил."],
      ["saves", "сейв"], ["goalsAgainst", "проп."], ["penalties", "уд."]];
    return labels.filter(([key]) => Number(row[key] || 0)).map(([key, label]) => `${row[key]} ${label}`).join(", ") || "без событий";
  }

  #formatDate(value) {
    return value.split("-").reverse().join(".");
  }
}
