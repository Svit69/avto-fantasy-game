import { VhlProtocolSourceResolver } from "./VhlProtocolSourceResolver.js";
import { VhlOnlineHtmlDataSource } from "./VhlOnlineHtmlDataSource.js";
import { VhlOnlineMatchDetailsParser } from "./VhlOnlineMatchDetailsParser.js";

export class VhlOnlineProtocolRegistrationService {
  constructor({ calendarRepository, view, sourceResolver = new VhlProtocolSourceResolver(), htmlSource = new VhlOnlineHtmlDataSource(), matchParser = new VhlOnlineMatchDetailsParser() }) {
    Object.assign(this, { calendarRepository, view, sourceResolver, htmlSource, matchParser });
  }

  async registerOnlineProtocol(source) {
    const protocolSource = this.sourceResolver.resolveSource(source.text);
    if (!protocolSource || protocolSource.type !== "online") return this.view.renderInvalidProtocolId(source.chatId);
    const calendarMatch = (await this.calendarRepository.listMatches()).find((match) => match.id === source.pending.matchId);
    if (!calendarMatch) return this.view.renderInvalidProtocolId(source.chatId);
    try {
      const html = await this.htmlSource.loadHtml(protocolSource.url);
      const onlineMatch = this.matchParser.parseMatch(html, { gameId: protocolSource.gameId });
      if (!this.#matchesCalendar(onlineMatch, calendarMatch)) return this.view.renderInvalidProtocolId(source.chatId);
    } catch { return this.view.renderInvalidProtocolId(source.chatId); }
    const match = await this.calendarRepository.updateMatchOnlineProtocolId(source.pending.matchId, protocolSource.gameId);
    return this.view.renderRegistrationResult(source.chatId, { match, onlineProtocolId: protocolSource.gameId });
  }

  #matchesCalendar(onlineMatch, calendarMatch) {
    return onlineMatch.homeTeam === calendarMatch.homeTeam && onlineMatch.awayTeam === calendarMatch.awayTeam
      && onlineMatch.scheduledAt?.slice(0, 10) === calendarMatch.startsAt?.slice(0, 10);
  }
}
