import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { AtomicJsonDocumentStore } from "./AtomicJsonDocumentStore.js";
import { OnlineMatchScheduleRepository } from "./OnlineMatchScheduleRepository.js";
import { OnlineMatchScheduleObserver } from "./OnlineMatchScheduleObserver.js";
import { OnlineCalendarScheduleEnricher } from "./OnlineCalendarScheduleEnricher.js";

export async function createOnlineScheduleFixture() {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "online-schedule-"));
  const previous = process.env.RUNTIME_STATE_DIRECTORY; process.env.RUNTIME_STATE_DIRECTORY = directory;
  const repository = new OnlineMatchScheduleRepository(new AtomicJsonDocumentStore(path.join(directory, "observations.json")));
  const notices = []; let now = Date.parse("2030-01-10T10:00:00+03:00");
  const observer = new OnlineMatchScheduleObserver({ repository, clock: () => now, notifier: { notifyOnce: async (...args) => notices.push(args) } });
  const match = { id: "match", tourId: "tour", league: "МХЛ", homeTeam: "Стальные Лисы", awayTeam: "МХК Авто", mhlGameId: "903310", startsAt: "2030-01-10T16:30:00+03:00" };
  const calendar = { tours: [{ id: "past", month: "past", deadlineAt: "2030-01-01T10:00:00+03:00" },
    { id: "tour", month: "next", startsAt: match.startsAt, deadlineAt: match.startsAt }], matches: [match] };
  const observed = { gameId: "903310", league: match.league, homeTeam: match.homeTeam, awayTeam: match.awayTeam, scheduledAt: "2030-01-10T11:00:00+03:00", status: "scheduled" };
  return { directory, repository, observer, calendar, match, observed, notices, enricher: new OnlineCalendarScheduleEnricher(repository),
    getNow: () => now, setNow: (value) => { now = value; },
    close: async () => { if (previous === undefined) delete process.env.RUNTIME_STATE_DIRECTORY; else process.env.RUNTIME_STATE_DIRECTORY = previous;
      await fs.rm(directory, { recursive: true, force: true }); } };
}
