import { VhlOnlineProtocolIdResolver } from "./VhlOnlineProtocolIdResolver.js";

export class VhlOnlineActiveMatchSelector {
  constructor(protocolIdResolver = new VhlOnlineProtocolIdResolver(), liveWindowMinutes = 240, finalLookbackHours = 48) {
    Object.assign(this, { protocolIdResolver, liveWindowMinutes, finalLookbackHours });
  }

  findActiveMatches(calendar, now = Date.now()) {
    return calendar.matches.map((match) => this.#attachOnlineGameId(match))
      .map((match) => this.#attachPollingMode(match, now))
      .filter((match) => this.#isPollableGornyakMatch(match, now));
  }

  #attachOnlineGameId(match) {
    return { ...match, onlineGameId: this.protocolIdResolver.resolveOnlineGameId(match) };
  }

  #attachPollingMode(match, now) {
    const startsAt = Date.parse(match.startsAt);
    return { ...match, isLivePollingWindow: now <= this.#createLiveEndsAt(startsAt) };
  }

  #isPollableGornyakMatch(match, now) {
    const startsAt = Date.parse(match.startsAt);
    const endsAt = startsAt + this.finalLookbackHours * 60 * 60 * 1000;
    return match.league === "ВХЛ" && match.featuredTeam === "Горняк-УГМК" && match.onlineGameId && now >= startsAt && now <= endsAt;
  }

  #createLiveEndsAt(startsAt) {
    return startsAt + this.liveWindowMinutes * 60 * 1000;
  }
}
