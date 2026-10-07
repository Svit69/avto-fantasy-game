import assert from "node:assert/strict";
import { AdminRouteParser } from "./AdminRouteParser.js";
import { AdminVhlOnlineRouteHandler } from "./AdminVhlOnlineRouteHandler.js";
import { VhlOnlineAdminView } from "./VhlOnlineAdminView.js";
import { VhlOnlineMatchCatalog } from "./VhlOnlineMatchCatalog.js";
import { CALENDAR_MATCHES } from "../src/data/calendarSeed.js";

const catalog = new VhlOnlineMatchCatalog({ listCalendar: async () => ({ matches: CALENDAR_MATCHES }) });
const months = await catalog.listManagedMonths();
assert(months.includes("2026-12") && months.includes("2027-03"), "later_months_missing");
assert((await catalog.listMatchesForMonth("2026-08")).some((match) => match.status === "finished"));
assert((await catalog.listMatchesForMonth("2026-11")).every((match) => match.startsAt.startsWith("2026-11-")));
assert.deepEqual(await catalog.listMatchesForMonth("2026-13"), []);

const view = new VhlOnlineAdminView();
let pendingMatchId = null;
const handler = new AdminVhlOnlineRouteHandler({ view, matchCatalog: catalog,
  stateStore: { waitForVhlOnlineProtocolId: (_chatId, matchId) => { pendingMatchId = matchId; } },
  fallbackView: { renderNotFound: () => ({ notFound: true }) } });
const parser = new AdminRouteParser();
const createCallbackSource = (data) => parser.parseUpdate({ callback_query: { id: "callback", data, from: { id: 1 }, message: { chat: { id: 2 } } } });
const monthReply = await handler.executeRoute(createCallbackSource("admin:vhl_online"));
const monthButtons = monthReply.reply_markup.inline_keyboard.flat();
assert(monthButtons.some((button) => button.callback_data === "admin:vhl_online_month:2027-03"));

const matchReply = await handler.executeRoute(createCallbackSource("admin:vhl_online_month:2026-12"));
const matchButtons = matchReply.reply_markup.inline_keyboard.flat();
const decemberMatches = await catalog.listMatchesForMonth("2026-12");
assert.equal(matchButtons.filter((button) => button.callback_data.startsWith("admin:vhl_online_match:")).length, decemberMatches.length);
assert(matchButtons.some((button) => button.callback_data === "admin:vhl_online"));

const selectedMatch = decemberMatches.at(-1);
const prompt = await handler.executeRoute(createCallbackSource(`admin:vhl_online_match:${selectedMatch.id}`));
assert.equal(pendingMatchId, selectedMatch.id);
assert(prompt.text.includes(selectedMatch.awayTeam));
console.log("VHL admin navigation self-test passed");
