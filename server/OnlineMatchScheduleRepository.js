import path from "node:path";
import { fileURLToPath } from "node:url";
import { AtomicJsonDocumentStore } from "./AtomicJsonDocumentStore.js";

export class OnlineMatchScheduleRepository {
  constructor(store = new AtomicJsonDocumentStore(path.join(process.env.RUNTIME_STATE_DIRECTORY ||
    fileURLToPath(new URL("../storage/runtime/", import.meta.url)), "online-match-schedules.json"))) { this.store = store; }
  async listObservations() { return Object.values(await this.store.readDocument()); }
  async recordObservation(expected, observed, now = Date.now()) {
    const field = { "МХЛ": "mhlGameId", "КХЛ": "khlGameId" }[expected?.league];
    if (!field || !expected.id || !expected.tourId || !expected[field] || !/^\d+$/.test(String(observed.gameId)) || String(expected[field]) !== String(observed.gameId)
      || ["league", "homeTeam", "awayTeam"].some((key) => expected[key] !== observed[key])
      || expected.startsAt?.slice(0, 10) !== observed.scheduledAt?.slice(0, 10)
      || !Number.isFinite(Date.parse(expected.startsAt)) || !Number.isFinite(now)
      || !Number.isFinite(Date.parse(observed.scheduledAt)) || !["scheduled", "live", "finished"].includes(observed.status)) throw Error("online_schedule_identity_mismatch");
    const key = `${expected.league}:${expected.id}:${observed.gameId}`;
    return this.store.mutateDocument((document) => {
      const previous = document[key];
      const startedAt = previous?.startedAt ?? (observed.status === "scheduled" ? null : Math.min(now, Date.parse(observed.scheduledAt)));
      document[key] = { id: expected.id, tourId: expected.tourId, league: expected.league, homeTeam: expected.homeTeam, awayTeam: expected.awayTeam,
        gameId: String(observed.gameId), gameIdField: field, scheduledAt: observed.scheduledAt, startedAt,
        deadlineAt: Math.min(Date.parse(expected.startsAt), previous?.deadlineAt ?? Infinity, Date.parse(observed.scheduledAt), startedAt ?? Infinity),
        previousStartsAt: previous?.scheduledAt !== observed.scheduledAt ? previous?.scheduledAt || expected.startsAt : previous.previousStartsAt,
        status: previous?.status === "finished" ? "finished" : startedAt !== null && observed.status === "scheduled" ? "live" : observed.status, observedAt: now };
      return { ...document[key], changed: !previous || ["scheduledAt", "startedAt", "deadlineAt", "status"].some((field) => previous[field] !== document[key][field]) };
    });
  }
}
