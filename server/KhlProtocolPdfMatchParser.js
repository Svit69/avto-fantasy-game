export class KhlProtocolPdfMatchParser {
  parseMatchDetails(content, identity = {}) {
    const lines = content.text.split("\n").map((line) => line.trim()).filter(Boolean);
    const dateLine = lines.find((line) => /\d{1,2} [а-яё]+ \d{4}/iu.test(line)) || "";
    const [homeTeam, awayTeam] = this.#extractTeams(lines);
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

  #extractTeams(lines) {
    const homeIndex = lines.findIndex((line) => line === "Автомобилист");
    const awayLine = lines.slice(homeIndex + 1).find((line) => line.includes("Металлург Мг"));
    return ["Автомобилист", awayLine || ""];
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
