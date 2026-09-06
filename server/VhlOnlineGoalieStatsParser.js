import { HtmlTextCleaner } from "./HtmlTextCleaner.js";

export class VhlOnlineGoalieStatsParser {
  constructor(cleaner = new HtmlTextCleaner()) { this.cleaner = cleaner; }

  parseRows(html, match, teamName) {
    const goalie = this.#findStartingGoalie(html, teamName);
    const totals = this.#parseMatchTotals(html);
    if (!goalie || !totals) return [];
    const teamSide = match.homeTeam === teamName ? "home" : "away";
    const opponentShots = teamSide === "home" ? totals.awayShotsOnGoal : totals.homeShotsOnGoal;
    const goalsAgainst = teamSide === "home" ? totals.awayGoals : totals.homeGoals;
    return [{ ...goalie, team: teamName, position: "вр", saves: Math.max(opponentShots - goalsAgainst, 0), goalsAgainst }];
  }

  #findStartingGoalie(html, teamName) {
    const block = html.match(/В воротах:([\s\S]*?)<\/p>/)?.[1] || "";
    return [...block.matchAll(/<b>\s*(\d+)\.\s*([^<]+)<\/b><\/a>\s*\(([^)]+)\)/g)]
      .map(([, number, name, team]) => ({ number, name: this.cleaner.stripTags(name), team: this.cleaner.stripTags(team) }))
      .find((goalie) => goalie.team === teamName) || null;
  }

  #parseMatchTotals(html) {
    const text = this.cleaner.stripTags(html.match(/Статистика матча:\s*<\/strong>([\s\S]*?)<\/p>/)?.[1] || "");
    const shots = text.match(/Броски в створ:\s*(\d+)\s*-\s*(\d+)/);
    const goals = text.match(/Голы:\s*(\d+)\s*-\s*(\d+)/);
    if (!shots || !goals) return null;
    return { homeShotsOnGoal: Number(shots[1]), awayShotsOnGoal: Number(shots[2]),
      homeGoals: Number(goals[1]), awayGoals: Number(goals[2]) };
  }
}
