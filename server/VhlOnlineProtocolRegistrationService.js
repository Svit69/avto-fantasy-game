import { VhlProtocolSourceResolver } from "./VhlProtocolSourceResolver.js";
import { VhlOnlineHtmlDataSource } from "./VhlOnlineHtmlDataSource.js";
import { VhlOnlineMatchDetailsParser } from "./VhlOnlineMatchDetailsParser.js";
import { VhlMatchIdentityGuard } from "./VhlMatchIdentityGuard.js";

export class VhlOnlineProtocolRegistrationService {
  constructor({ calendarRepository, view, sourceResolver = new VhlProtocolSourceResolver(), htmlSource = new VhlOnlineHtmlDataSource(), matchParser = new VhlOnlineMatchDetailsParser(), identityGuard = new VhlMatchIdentityGuard(), now = () => Date.now() }) {
    Object.assign(this, { calendarRepository, view, sourceResolver, htmlSource, matchParser, identityGuard, now });
  }

  async registerOnlineProtocol(source) {
    const protocolSource = this.sourceResolver.resolveSource(source.text);
    if (!protocolSource || protocolSource.type !== "online") return this.view.renderInvalidProtocolId(source.chatId);
    const calendarMatch = (await this.calendarRepository.listMatches()).find((match) => match.id === source.pending.matchId);
    if (!calendarMatch) return this.view.renderInvalidProtocolId(source.chatId);
    let verificationStatus = "verified";
    try {
      const html = await this.htmlSource.loadHtml(protocolSource.url);
      const onlineMatch = this.matchParser.parseMatch(html, { gameId: protocolSource.gameId });
      this.identityGuard.validate(onlineMatch, calendarMatch);
    } catch (error) {
      const isUnavailable = ["vhl_online_game_not_found", "vhl_online_http_404"].includes(error.message);
      if (!isUnavailable || Date.parse(calendarMatch.startsAt) <= this.now()) return this.view.renderInvalidProtocolId(source.chatId);
      verificationStatus = "pending";
    }
    const match = await this.calendarRepository.updateMatchOnlineProtocolId(source.pending.matchId, protocolSource.gameId);
    return this.view.renderRegistrationResult(source.chatId, { match, onlineProtocolId: protocolSource.gameId, verificationStatus });
  }
}
