export class KhlProtocolPdfMatchParser {
  parseMatchDetails(content, identity = {}) {
    const lines = content.text.split("\n").map((line) => line.trim()).filter(Boolean);
    const dateLine = lines.find((line) => /\d{1,2} [а-яё]+ \d{4}/iu.test(line)) || "";
    const [homeTeam, awayTeam] = this.#extractTeams(content, lines);
    return {
      tournamentId: String(identity.tournamentId || ""),
      gameId: String(identity.gameId || ""),
      homeTeamId: String(identity.homeTeamId || ""),
      awayTeamId: String(identity.awayTeamId || ""),
      homeTeam,
      awayTeam,
      opponentTeam: homeTeam === "Автомобилист" ? awayTeam : homeTeam,
      league: identity.league || "КХЛ",
      status: identity.status || "finished",
      arena: this.#matchText(content.text, /зрителей,\s*«([^»]+)»/u),
      scheduledAt: this.#createScheduledAt(dateLine, this.#matchText(content.text, /Начало матча:\s*(\d{1,2}:\d{2})/u)),
      createdAt: new Date().toISOString(),
    };
  }

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
    return ["Автомобилист", "Горняк-УГМК", "МХК Авто"].find((team) => lines.includes(team)) || "";
  }

  #createScheduledAt(dateLine, time) {
    const date = this.#parseRussianDate(dateLine);
    return date && time ? `${date}T${time}:00+05:00` : null;
  }

  #parseRussianDate(line) {
    const months = { января: "01", февраля: "02", марта: "03", апреля: "04", мая: "05", июня: "06", июля: "07", августа: "08", сентября: "09", октября: "10", ноября: "11", декабря: "12" };
    const match = line.match(/(\d{1,2}) ([а-яё]+) (\d{4})/iu);
    return match ? `${match[3]}-${months[match[2].toLowerCase()]}-${match[1].padStart(2, "0")}` : null;
  }

  #matchText(text, pattern) { return text.match(pattern)?.[1] || null; }
}
