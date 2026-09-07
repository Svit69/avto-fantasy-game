import crypto from "node:crypto";

export class KhlEventKeyFactory {
  createEventKey(event) {
    if (event.eventId) return [event.tournamentId, event.gameId, event.eventId].map((part) => String(part || "")).join(":");
    const source = [event.gameId, event.period, event.gameTime, event.eventType, event.playerId, event.role].join(":");
    return crypto.createHash("sha256").update(source).digest("hex");
  }

  createSourceHash(payload) {
    return crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
  }
}
