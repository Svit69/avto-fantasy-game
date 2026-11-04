import assert from "node:assert/strict";
import { KhlOnlinePollingService } from "./KhlOnlinePollingService.js";
import { OnlineHockeyLeagueConfiguration } from "./OnlineHockeyLeagueConfiguration.js";
import { calendarMatch } from "./mhl-online-test-context.js";

const states = new Map(); const notices = [];
const store = { resolveFile: () => "unused", readState: async (key) => states.get(key), writeState: async (key, value) => states.set(key, structuredClone(value)) };
const scheduleProbe = { inspectMatch: async () => ({ ok: true, state: { failures: 0, sourceStatus: "scheduled" } }) };
const service = new KhlOnlinePollingService({ store, scheduleProbe, configuration: OnlineHockeyLeagueConfiguration.mhl(),
  calendarRepository: { listCalendar: async () => ({ matches: [calendarMatch] }) },
  selector: { findDueMatches: () => [{ ...calendarMatch, isScheduleProbe: true }] }, logger: { warn() {}, info() {} },
  collector: { collectMatch: () => { throw Error("statistics_must_not_be_requested_by_header_probe"); } },
  notifier: { notifyOnce: async (...args) => notices.push(args) } });
service.lock = { acquireLock: async () => true, releaseLock: async () => {} };
await service.pollActiveMatches();
assert.ok(states.get("mhl-online-matches.json")[calendarMatch.id].nextPollAt - Date.now() > 1799000);
scheduleProbe.inspectMatch = async () => ({ ok: true, state: { failures: 0, sourceStatus: "live" } });
await service.pollActiveMatches();
assert.ok(states.get("mhl-online-matches.json")[calendarMatch.id].nextPollAt - Date.now() <= 300000);
scheduleProbe.inspectMatch = async () => { throw Object.assign(Error("mhl_goalie_protocol_http_403"), { observedMatch: { status: "live" } }); };
for (let index = 0; index < 3; index++) await service.pollActiveMatches();
assert.equal(notices.at(-1)[1], "error:goalie-protocol");
assert.match(notices.at(-1)[4], /Загрузите протокол МХЛ/);
console.log("MHL scheduled 30-minute probes, live 5-minute collection and actionable goalie error notice self-test passed");
