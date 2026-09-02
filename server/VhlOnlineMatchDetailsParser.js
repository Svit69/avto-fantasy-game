import { HtmlTextCleaner } from "./HtmlTextCleaner.js";

export class VhlOnlineMatchDetailsParser {
  constructor(cleaner = new HtmlTextCleaner()) { this.cleaner = cleaner; }

  parseMatch(html, identity = {}) {
    const title = this.cleaner.stripTags(html.match(/<title>(.*?)<\/title>/s)?.[1] || "");
    const [, gameNumber, date, homeTeam, awayTeam] = title.match(/Игра номер\s+(\d+)\s+(.+?):\s*(.+?)-(.+?)\s*\(/) || [];
    return { tournamentId: String(identity.tournamentId || "vhl-online"), gameId: String(identity.gameId || ""),
      homeTeamId: "", awayTeamId: "", homeTeam: homeTeam || "", awayTeam: awayTeam || "",
      opponentTeam: this.#resolveOpponent(homeTeam, awayTeam), arena: this.#parseArena(html), league: "ВХЛ",
      status: this.#parseStatus(html), scheduledAt: this.#parseDate(date), sourceGameNumber: gameNumber || "",
      createdAt: new Date().toISOString() };
  }

  #resolveOpponent(homeTeam, awayTeam) {
    return homeTeam === "Горняк-УГМК" ? awayTeam : homeTeam;
  }

  #parseArena(html) {
    return this.cleaner.stripTags(html.match(/<div class="game__location">(.*?)<\/div>/s)?.[1] || "");
  }

  #parseStatus(html) {
    return /матч завершен/i.test(html) ? "finished" : "live";
  }

  #parseDate(value) {
    const months = { янв: "01", фев: "02", мар: "03", апр: "04", мая: "05", июн: "06", июл: "07", авг: "08", сен: "09", окт: "10", ноя: "11", дек: "12" };
    const match = String(value || "").match(/(\d{1,2})\s+([а-яё]{3})\s+(\d{4})/iu);
    return match ? `${match[3]}-${months[match[2].toLowerCase()]}-${match[1].padStart(2, "0")}T00:00:00+03:00` : null;
  }
}
