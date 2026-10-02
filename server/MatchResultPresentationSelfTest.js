import { AdminMatchScoreFormatter } from "./AdminMatchScoreFormatter.js";
import { HockeyMatchScoreFormatter } from "../src/formatters/HockeyMatchScoreFormatter.js";
import { KhlProtocolPdfScoreParser } from "./KhlProtocolPdfScoreParser.js";
import { MatchImportIntegrityAuditor } from "./MatchImportIntegrityAuditor.js";
import { PlayerMatchStatsCalculator } from "./PlayerMatchStatsCalculator.js";
import { VhlOnlineScoreParser } from "./VhlOnlineScoreParser.js";
import { VhlReportScoreParser } from "./VhlReportScoreParser.js";

export class MatchResultPresentationSelfTest {
  run() {
    const pdfScore = new KhlProtocolPdfScoreParser().parseFinalScore(["Начало матча: 19:00", "3 4", "Овертайм"]);
    const inlinePdfScore = new KhlProtocolPdfScoreParser().parseFinalScore(["1 Начало матча: 18:30 4", "Основное время"]);
    const shootoutPdfScore = new KhlProtocolPdfScoreParser().parseFinalScore(["Начало матча: 18:32", "2 3", "Буллиты"]);
    const positionedPdfScore = new KhlProtocolPdfScoreParser().parseFinalScore(["Начало матча: 18:30", "Основное время"], [[{ text: "1", x: 195, y: 704 }, { text: "Начало матча: 18:30", x: 278, y: 704 }, { text: "4", x: 411, y: 704 }]]);
    const onlineScore = new VhlOnlineScoreParser().parseScore('<div class="game__score">4:3 <span>Б</span></div>');
    const reportScore = new VhlReportScoreParser().parseScore('<p class="match-card__score"><strong>2:1</strong> ОТ</p>');
    this.#assert(pdfScore?.decidedBy === "overtime", "pdf_overtime");
    this.#assert(inlinePdfScore?.homeGoals === 1 && inlinePdfScore.awayGoals === 4, "pdf_inline_score");
    this.#assert(shootoutPdfScore?.decidedBy === "shootout", "pdf_shootout");
    this.#assert(positionedPdfScore?.homeGoals === 1 && positionedPdfScore.awayGoals === 4, "pdf_positioned_score");
    this.#assert(onlineScore?.decidedBy === "shootout", "online_shootout");
    this.#assert(reportScore?.decidedBy === "overtime", "report_overtime");
    this.#assert(new HockeyMatchScoreFormatter().format({ ...onlineScore, homeScore: 4, awayScore: 3 }) === "4 - 3 Б", "score_format");
    this.#assert(this.#createApiMatchStats().decidedBy === "shootout", "api_decision_type");
    this.#assert(new AdminMatchScoreFormatter().format(shootoutPdfScore) === "Счет: 2:3 Б", "admin_score_format");
    this.#assert(new MatchImportIntegrityAuditor().audit({ matches: [{ id: "match" }] })[0]?.type === "missing_match_score", "missing_score_audit");
  }

  #createApiMatchStats() {
    const selector = { selectPlayerMatchStats: () => [{ match: { id: "match", score: { homeGoals: 4, awayGoals: 3, decidedBy: "shootout" } }, stat: {}, calendarMatch: { id: "calendar-match" } }] };
    return new PlayerMatchStatsCalculator(selector).createPlayerMatchStats({})[0];
  }

  #assert(condition, name) {
    if (!condition) throw new Error(`match_result_presentation_self_test_failed:${name}`);
  }
}
