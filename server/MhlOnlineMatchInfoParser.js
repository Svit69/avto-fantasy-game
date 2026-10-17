import { MhlTeamNameNormalizer } from "./MhlTeamNameNormalizer.js";

export class MhlOnlineMatchInfoParser {
  parseMatchInfo(document, gameId) {
    const header = document(".game_info");
    const names = header.find(".game_info_team_name").map((index, element) => new MhlTeamNameNormalizer().normalizeTeamName(document(element).text())).get();
    const logos = header.find(".game_info_team_thumb img").map((index, element) => document(element).attr("src")).get();
    const date = header.find(".game_info_bottom_info").text().match(/(\d{1,2})\s+([а-яё]+)\s+(\d{4}),?\s+(\d{2}:\d{2})/iu);
    const months = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
    const month = date && months.findIndex((name) => date[2].toLowerCase().startsWith(name));
    if (names.length !== 2 || !date || month < 0) throw new Error("mhl_match_identity_missing");
    const scoreNodes = header.find(".game_info_score-item-h, .game_info_score-item-v");
    const scores = scoreNodes.map((index, element) => document(element).text().trim()).get();
    const statusText = header.find(".game_info_score-byperiod_val").text().trim();
    const status = /матч заверш[её]н/iu.test(statusText) ? 90 : /период|перерыв|овертайм|буллит|серия бросков|ид[её]т матч/iu.test(statusText) ? 10
      : /не нач|ожидани|состоится|заплан|до начала|начн[её]тся|^начало/iu.test(statusText) ? 0 : null;
    if (status === null) throw new Error("mhl_match_status_unknown");
    const scoreText = header.find(".game_info_score").text().trim();
    const suffix = header.find(".game_info_score-item-addinfo").text().trim() || scoreText.match(/(ОТ|ПБ|Б|OT|SO)\s*$/iu)?.[1] || "";
    const pdfIds = header.find('a[href*="/pdf/"]').map((index, element) => document(element).attr("href")?.match(/\/pdf\/\d+\/(\d+)\//)?.[1]).get();
    if (pdfIds.some((id) => id !== String(gameId))) throw new Error("mhl_page_game_id_mismatch");
    const winner = scoreNodes.filter(".game_info_score-item-win");
    return { info: { data: { id: String(gameId), date: `${date[3]}-${String(month + 1).padStart(2, "0")}-${date[1].padStart(2, "0")}`,
      time: `${date[4]}:00`, score: scores.length === 2 && scores.every((value) => /^\d+$/.test(value)) ? scores.join(":") : "",
      ots: suffix, winner: winner.length === 1 ? winner.hasClass("game_info_score-item-h") ? "A" : "B" : null,
      teama: logos[0]?.match(/\/\d+\/(\d+)\/90\.png/)?.[1], teamb: logos[1]?.match(/\/\d+\/(\d+)\/90\.png/)?.[1] } },
      teams: { home: { name: names[0] }, visitor: { name: names[1] } }, gameItem: { status, statusvalue: statusText } };
  }
}
