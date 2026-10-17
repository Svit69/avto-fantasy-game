import { KhlOnlineScoreParser } from "./KhlOnlineScoreParser.js";
import { OnlineHockeyLeagueConfiguration } from "./OnlineHockeyLeagueConfiguration.js";

export class KhlOnlineMatchParser {
  constructor(configuration = OnlineHockeyLeagueConfiguration.khl()) { this.configuration = configuration; }
  parseMatch(game, expected = null) {
    const info = game.info?.data;
    const homeTeam = game.teams?.home?.name; const awayTeam = game.teams?.visitor?.name;
    if (!info || !homeTeam || !awayTeam) throw new Error("khl_online_match_missing");
    const scheduledAt = `${info.date}T${info.time}+03:00`;
    if (expected && (expected.league && expected.league !== this.configuration.league || String(info.id) !== String(expected[this.configuration.gameIdField])
      || [homeTeam, awayTeam].sort().join("|") !== [expected.homeTeam, expected.awayTeam].sort().join("|")
      || info.date !== String(expected.startsAt).slice(0, 10))) throw new Error("khl_online_calendar_mismatch");
    if (![homeTeam, awayTeam].includes(this.configuration.teamName)) throw new Error("khl_online_wrong_clubs");
    const status = Number(game.gameItem?.status) === 90 || /матч заверш[её]н/iu.test(game.gameItem?.statusvalue || "")
      ? "finished" : Number(game.gameItem?.status) > 0 ? "live" : "scheduled";
    const score = new KhlOnlineScoreParser().parseScore(info, status);
    return { gameId: String(info.id), league: this.configuration.league, sourceType: `${this.configuration.key}-online`, homeTeam, awayTeam,
      homeTeamId: String(info.teama), awayTeamId: String(info.teamb), scheduledAt, score, status };
  }
}
