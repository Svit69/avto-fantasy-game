import { KhlEventKeyFactory } from "./KhlEventKeyFactory.js";

export class KhlEventNormalizer {
  constructor(keyFactory = new KhlEventKeyFactory()) { this.keyFactory = keyFactory; }

  normalizeRawEvents(match, rawEvents) {
    return rawEvents.map((rawEvent) => this.#normalizeRawEvent(match, rawEvent));
  }

  #normalizeRawEvent(match, raw) {
    const event = { eventId: raw.eventId || raw.id || null, tournamentId: match.tournamentId, gameId: match.gameId,
      period: raw.period ?? null, gameTime: raw.gameTime || raw.time || null, eventType: this.#normalizeType(raw.eventType || raw.type),
      playerId: String(raw.playerId || raw.khlPlayerId || ""), secondaryPlayerId: raw.secondaryPlayerId ? String(raw.secondaryPlayerId) : null,
      teamId: raw.teamId ? String(raw.teamId) : null, role: raw.role || null, isScoringEvent: Boolean(raw.isScoringEvent),
      sourceVersion: raw.sourceVersion || null, rawPayload: raw };
    return { ...event, eventKey: this.keyFactory.createEventKey(event), sourceHash: this.keyFactory.createSourceHash(raw) };
  }

  #normalizeType(type) {
    return String(type || "").replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`).replace(/^_/, "");
  }
}
