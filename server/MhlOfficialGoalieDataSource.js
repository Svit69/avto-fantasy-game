import { LimitedResponseBodyReader } from "./LimitedResponseBodyReader.js";
import { KhlProtocolPdfTextExtractor } from "./KhlProtocolPdfTextExtractor.js";
import { KhlProtocolPdfMatchParser } from "./KhlProtocolPdfMatchParser.js";
import { KhlProtocolGoalieTableParser } from "./KhlProtocolGoalieTableParser.js";
import { MhlTeamNameNormalizer } from "./MhlTeamNameNormalizer.js";
import { MhlOfficialGoalieRowsValidator } from "./MhlOfficialGoalieRowsValidator.js";

export class MhlOfficialGoalieDataSource {
  constructor(fetcher = fetch, extractor = new KhlProtocolPdfTextExtractor()) { Object.assign(this, { fetcher, extractor }); }
  async resolveGoalies(game, gameId) {
    if (!/^[1-9]\d{0,9}$/.test(String(gameId))) throw Error("mhl_invalid_game_id");
    if (Number(game.gameItem.status) !== 90) throw Error("mhl_goalie_protocol_not_final");
    const url = `https://mhl.khl.ru/pdf/1440/${gameId}/game-${gameId}-ru.pdf`;
    const response = await this.fetcher(url, { signal: AbortSignal.timeout(15000), redirect: "error" });
    if (!response.ok) throw Error(`mhl_goalie_protocol_http_${response.status}`);
    const buffer = await new LimitedResponseBodyReader().readBuffer(response, 8388608);
    if (buffer.subarray(0, 5).toString("ascii") !== "%PDF-") throw Error("mhl_goalie_protocol_invalid_pdf");
    const content = await this.extractor.extractPdfContent(buffer);
    const match = new KhlProtocolPdfMatchParser().parseMatchDetails(content);
    const normalize = (name) => new MhlTeamNameNormalizer().normalizeTeamName(name);
    if (normalize(match.homeTeam) !== game.teams.home.name || normalize(match.awayTeam) !== game.teams.visitor.name
      || match.scheduledAt?.slice(0, 10) !== game.info.data.date
      || `${match.score?.homeGoals}:${match.score?.awayGoals}` !== game.info.data.score) throw Error("mhl_goalie_protocol_identity_mismatch");
    const parser = new KhlProtocolGoalieTableParser();
    const rows = [match.homeTeam, match.awayTeam].flatMap((team) => parser.parseGoalieRows(content, team));
    game.officialGoalieRows = new MhlOfficialGoalieRowsValidator().validateRows(rows, game);
    return game;
  }
}
