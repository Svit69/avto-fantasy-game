import { KhlProtocolPdfDateParser } from "./KhlProtocolPdfDateParser.js";
import { KhlProtocolPdfScoreParser } from "./KhlProtocolPdfScoreParser.js";

export class KhlProtocolPdfMatchParser {
  constructor(dateParser = new KhlProtocolPdfDateParser(), scoreParser = new KhlProtocolPdfScoreParser()) { Object.assign(this, { dateParser, scoreParser }); }

  parseMatchDetails(content, identity = {}) {
    const lines = content.text.split("\n").map((line) => line.trim()).filter(Boolean);
    const dateLine = lines.find((line) => /\d{1,2} [а-яё]+ \d{4}/iu.test(line)) || "";
    const [homeTeam, awayTeam] = this.#extractTeams(content, lines);
    const score = this.scoreParser.parseFinalScore(lines);
    return {
      tournamentId: String(identity.tournamentId || ""),
      gameId: String(identity.gameId || ""),
      homeTeamId: String(identity.homeTeamId || ""),
      awayTeamId: String(identity.awayTeamId || ""),
      homeTeam,
      awayTeam,
      protocolHomeTeam: homeTeam,
      protocolAwayTeam: awayTeam,
      opponentTeam: homeTeam === "Автомобилист" ? awayTeam : homeTeam,
      league: identity.league || "КХЛ",
      score,
      status: identity.status || "finished",
      arena: this.#matchText(content.text, /зрителей,\s*(?:«([^»]+)»|([^\n]+))/u),
      scheduledAt: this.dateParser.createScheduledAt(dateLine, this.#matchText(content.text, /Начало матча:\s*(\d{1,2}:\d{2})/u)),
      createdAt: new Date().toISOString(),
    }; }
  #extractTeams(content, lines) {
    const firstPage = content.pages[0] || [];
    const homeTeam = this.#readTeamByZone(firstPage, 80, 230) || this.#readKnownTeam(lines);
    const awayTeam = this.#readTeamByZone(firstPage, 390, 540) || "";
    return [homeTeam, awayTeam];
  }
  #readTeamByZone(page, minX, maxX) {
    const team = page.find((item) => item.y > 650 && item.y < 680 && item.x >= minX && item.x <= maxX && !item.text.startsWith("Игра"));
    return team?.text || "";
  }
  #readKnownTeam(lines) {
    return ["Автомобилист", "Горняк-УГМК", "МХК Авто", "Авто"].find((team) => lines.includes(team)) || "";
  }
  #matchText(text, pattern) {
    const match = text.match(pattern);
    return match ? match.slice(1).find(Boolean)?.trim() || null : null;
  }
}
