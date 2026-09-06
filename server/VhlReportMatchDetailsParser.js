import { HtmlTextCleaner } from "./HtmlTextCleaner.js";

export class VhlReportMatchDetailsParser {
  constructor(cleaner = new HtmlTextCleaner()) { this.cleaner = cleaner; }

  parseMatch(html, identity = {}) {
    const [homeTeam, awayTeam] = this.#parseTeamNames(html);
    return { tournamentId: String(identity.tournamentId || "vhl-report"), gameId: String(identity.gameId || ""),
      homeTeamId: "", awayTeamId: "", homeTeam, awayTeam, opponentTeam: this.#resolveOpponent(homeTeam, awayTeam),
      arena: "", league: "ВХЛ", status: "finished", scheduledAt: identity.scheduledAt || this.#parseDate(html),
      createdAt: new Date().toISOString() };
  }

  #parseTeamNames(html) {
    return [...html.matchAll(/match-card__team-name">([\s\S]*?)<\/strong>/g)]
      .slice(0, 2).map(([, name]) => this.cleaner.stripTags(name));
  }

  #resolveOpponent(homeTeam, awayTeam) {
    return homeTeam === "Горняк-УГМК" ? awayTeam : homeTeam;
  }

  #parseDate(html) {
    const value = this.cleaner.stripTags(html.match(/class="match-card__date"[\s\S]*?>([\s\S]*?)<\/time>/)?.[1] || "");
    const months = { Январь: "01", Февраль: "02", Март: "03", Апрель: "04", Май: "05", Июнь: "06", Июль: "07", Август: "08", Сентябрь: "09", Октябрь: "10", Ноябрь: "11", Декабрь: "12" };
    const match = value.match(/(\d{2})\s+([А-ЯЁа-яё]+)\s+(\d{4}).*?(\d{2}:\d{2})/u);
    return match ? `${match[3]}-${months[match[2]]}-${match[1]}T${match[4]}:00+03:00` : null;
  }
}
