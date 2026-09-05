import { KhlProtocolFantasyEventFactory } from "./KhlProtocolFantasyEventFactory.js";
import { KhlProtocolGoalSectionParser } from "./KhlProtocolGoalSectionParser.js";
import { KhlProtocolGoalieTableParser } from "./KhlProtocolGoalieTableParser.js";
import { KhlProtocolPdfMatchParser } from "./KhlProtocolPdfMatchParser.js";
import { KhlProtocolPdfTextExtractor } from "./KhlProtocolPdfTextExtractor.js";
import { KhlProtocolPlayerMatcher } from "./KhlProtocolPlayerMatcher.js";
import { KhlProtocolScorerStatsMerger } from "./KhlProtocolScorerStatsMerger.js";
import { KhlProtocolSkaterTableParser } from "./KhlProtocolSkaterTableParser.js";
import { KhlProtocolTeamNameNormalizer } from "./KhlProtocolTeamNameNormalizer.js";

export class KhlProtocolPdfDataProvider {
  constructor({ pdfBuffer, identity, players }) {
    Object.assign(this, { pdfBuffer, identity, players, teamNormalizer: new KhlProtocolTeamNameNormalizer(identity?.league), extractor: new KhlProtocolPdfTextExtractor(),
      matchParser: new KhlProtocolPdfMatchParser(), skaterParser: new KhlProtocolSkaterTableParser(),
      goalParser: new KhlProtocolGoalSectionParser(), statsMerger: new KhlProtocolScorerStatsMerger(),
      goalieParser: new KhlProtocolGoalieTableParser(), eventFactory: new KhlProtocolFantasyEventFactory() });
  }

  async getMatch() {
    const content = await this.#getContent();
    return { ...this.teamNormalizer.normalizeMatchTeams(this.matchParser.parseMatchDetails(content, this.identity)), ...this.identity };
  }

  async getPlayByPlay() {
    const content = await this.#getContent();
    const match = this.matchParser.parseMatchDetails(content, this.identity);
    const teams = [match.protocolHomeTeam || match.homeTeam, match.protocolAwayTeam || match.awayTeam].filter(Boolean);
    const rows = teams.flatMap((team) => this.#parseTeamRows(content, team));
    return this.eventFactory.createRawEvents(rows, new KhlProtocolPlayerMatcher(this.players, this.identity?.league));
  }

  #parseTeamRows(content, team) {
    const skaterRows = this.skaterParser.parseSkaterRows(content, team);
    const scorerRows = this.goalParser.parseScorerRows(content, team);
    return [...this.statsMerger.mergeScorerGoals(skaterRows, scorerRows), ...this.goalieParser.parseGoalieRows(content, team)];
  }

  async #getContent() {
    if (!this.content) this.content = await this.extractor.extractPdfContent(this.pdfBuffer);
    return this.content;
  }
}
