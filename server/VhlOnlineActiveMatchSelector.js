import { VhlOnlineProtocolIdResolver } from "./VhlOnlineProtocolIdResolver.js";

export class VhlOnlineActiveMatchSelector {
  constructor(protocolIdResolver = new VhlOnlineProtocolIdResolver()) {
    this.protocolIdResolver = protocolIdResolver;
  }

  findActiveMatches(calendar, now = Date.now()) {
    return calendar.matches.map((match) => this.#attachOnlineGameId(match))
      .filter((match) => this.#isPollableGornyakMatch(match, now));
  }

  #attachOnlineGameId(match) {
    return { ...match, onlineGameId: this.protocolIdResolver.resolveOnlineGameId(match) };
  }

  #isPollableGornyakMatch(match, now) {
    const startsAt = Date.parse(match.startsAt);
    const endsAt = startsAt + 180 * 60 * 1000;
    return match.league === "ВХЛ" && match.featuredTeam === "Горняк-УГМК" && match.onlineGameId && now >= startsAt && now <= endsAt;
  }
}
