import { VhlProtocolSourceResolver } from "./VhlProtocolSourceResolver.js";

export class VhlOnlineProtocolRegistrationService {
  constructor({ calendarRepository, view, sourceResolver = new VhlProtocolSourceResolver() }) {
    Object.assign(this, { calendarRepository, view, sourceResolver });
  }

  async registerOnlineProtocol(source) {
    const protocolSource = this.sourceResolver.resolveSource(source.text);
    if (!protocolSource || protocolSource.type !== "online") return this.view.renderInvalidProtocolId(source.chatId);
    const match = await this.calendarRepository.updateMatchOnlineProtocolId(source.pending.matchId, protocolSource.gameId);
    return this.view.renderRegistrationResult(source.chatId, { match, onlineProtocolId: protocolSource.gameId });
  }
}
