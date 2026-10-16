import { KhlOnlineScoreParser } from "./KhlOnlineScoreParser.js";

export class KhlOnlineMatchParser {
  parseMatch(game, expected = null) {
    const info = game.info?.data;
    const homeTeam = game.teams?.home?.name; const awayTeam = game.teams?.visitor?.name;
    if (!info || !homeTeam || !awayTeam) throw new Error("khl_online_match_missing");
    const scheduledAt = `${info.date}T${info.time}+03:00`;
    if (expected && (String(info.id) !== String(expected.khlGameId)
      || [homeTeam, awayTeam].sort().join("|") !== [expected.homeTeam, expected.awayTeam].sort().join("|")
      || info.date !== String(expected.startsAt).slice(0, 10))) throw new Error("khl_online_calendar_mismatch");
    if (homeTeam !== "Автомобилист" && awayTeam !== "Автомобилист") throw new Error("khl_online_wrong_clubs");
    const status = Number(game.gameItem?.status) === 90 || /матч заверш[её]н/iu.test(game.gameItem?.statusvalue || "")
      ? "finished" : Number(game.gameItem?.status) > 0 ? "live" : "scheduled";
    const score = new KhlOnlineScoreParser().parseScore(info, status);
    return { gameId: String(info.id), league: "КХЛ", sourceType: "khl-online", homeTeam, awayTeam,
      homeTeamId: String(info.teama), awayTeamId: String(info.teamb), scheduledAt, score, status };
  }
}
