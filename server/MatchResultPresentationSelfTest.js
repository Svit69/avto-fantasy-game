import { HockeyMatchScoreFormatter } from "../src/formatters/HockeyMatchScoreFormatter.js";
import { KhlProtocolPdfScoreParser } from "./KhlProtocolPdfScoreParser.js";
import { PlayerMatchStatsCalculator } from "./PlayerMatchStatsCalculator.js";
import { VhlOnlineScoreParser } from "./VhlOnlineScoreParser.js";
import { VhlReportScoreParser } from "./VhlReportScoreParser.js";

export class MatchResultPresentationSelfTest {
  run() {
    const pdfScore = new KhlProtocolPdfScoreParser().parseFinalScore(["Начало матча: 19:00", "3 4", "Овертайм"]);
    const onlineScore = new VhlOnlineScoreParser().parseScore('<div class="game__score">4:3 <span>Б</span></div>');
    const reportScore = new VhlReportScoreParser().parseScore('<p class="match-card__score"><strong>2:1</strong> ОТ</p>');
    this.#assert(pdfScore?.decidedBy === "overtime", "pdf_overtime");
    this.#assert(onlineScore?.decidedBy === "shootout", "online_shootout");
    this.#assert(reportScore?.decidedBy === "overtime", "report_overtime");
    this.#assert(new HockeyMatchScoreFormatter().format({ ...onlineScore, homeScore: 4, awayScore: 3 }) === "4 - 3 Б", "score_format");
    this.#assert(this.#createApiMatchStats().decidedBy === "shootout", "api_decision_type");
  }

  #createApiMatchStats() {
    const selector = { selectPlayerMatchStats: () => [{ match: { id: "match", score: { homeGoals: 4, awayGoals: 3, decidedBy: "shootout" } }, stat: {}, calendarMatch: { id: "calendar-match" } }] };
    return new PlayerMatchStatsCalculator(selector).createPlayerMatchStats({})[0];
  }

  #assert(condition, name) {
    if (!condition) throw new Error(`match_result_presentation_self_test_failed:${name}`);
  }
}
