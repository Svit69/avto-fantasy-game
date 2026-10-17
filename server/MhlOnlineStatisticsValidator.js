import { KhlOnlineScoreParser } from "./KhlOnlineScoreParser.js";

export class MhlOnlineStatisticsValidator {
  validateScore(game) {
    const status = game.gameItem.status === 90 ? "finished" : "live";
    const score = new KhlOnlineScoreParser().parseScore(game.info.data, status);
    if (!score) throw new Error("mhl_score_missing");
    const totals = game.tab_stats.teamstats[0].data;
    const home = totals.find((item) => item.team === "A").stats.g;
    const away = totals.find((item) => item.team === "B").stats.g;
    const same = score.homeGoals === home && score.awayGoals === away;
    const shootout = score.decidedBy === "shootout" && home === away
      && score.homeGoals + score.awayGoals === home + away + 1;
    if (!same && !shootout) throw new Error("mhl_score_totals_mismatch");
  }
}
