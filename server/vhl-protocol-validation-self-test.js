import { VhlOnlineHtmlDataSource } from "./VhlOnlineHtmlDataSource.js";
import { VhlOnlineProtocolRegistrationService } from "./VhlOnlineProtocolRegistrationService.js";
import { VhlOnlineAdminNotificationTextFactory } from "./VhlOnlineAdminNotificationTextFactory.js";
import { VhlOnlineScoreParser } from "./VhlOnlineScoreParser.js";

const invalidSource = new VhlOnlineHtmlDataSource(async () => ({ ok: true, url: "https://online.vhlru.ru/online/", text: async () => "list" }));
await invalidSource.loadHtml("https://online.vhlru.ru/online/905147.html")
  .then(() => { throw new Error("vhl_redirect_accepted"); }, (error) => {
    if (error.message !== "vhl_online_game_not_found") throw error;
  });

const calendarMatch = { id: "october-match", startsAt: "2026-10-04T11:00:00+03:00", homeTeam: "Горняк-УГМК", awayTeam: "Нефтяник" };
let savedId = null;
const calendarRepository = {
  listMatches: async () => [calendarMatch],
  updateMatchOnlineProtocolId: async (_matchId, gameId) => { savedId = gameId; return calendarMatch; },
};
const view = { renderInvalidProtocolId: () => ({ invalid: true }), renderRegistrationResult: (_chatId, result) => result };
const registration = new VhlOnlineProtocolRegistrationService({ calendarRepository, view,
  htmlSource: { loadHtml: async () => "valid page" },
  matchParser: { parseMatch: () => ({ homeTeam: "Другая команда", awayTeam: "Нефтяник", scheduledAt: "2026-10-04T00:00:00+03:00" }) } });
const source = { chatId: "1", text: "904147", pending: { matchId: calendarMatch.id } };
if (!(await registration.registerOnlineProtocol(source)).invalid || savedId) throw new Error("vhl_wrong_match_accepted");
registration.matchParser = { parseMatch: () => ({ ...calendarMatch, scheduledAt: calendarMatch.startsAt }) };
if ((await registration.registerOnlineProtocol(source)).onlineProtocolId !== "904147") throw new Error("vhl_correct_match_rejected");

const score = new VhlOnlineScoreParser().parseScore('<div class="game__score">1<span>:</span>2<span>Б</span></div>');
if (score?.homeGoals !== 1 || score.awayGoals !== 2 || score.decidedBy !== "shootout") throw new Error("vhl_shootout_score_incorrect");
const finalText = new VhlOnlineAdminNotificationTextFactory().createFinalCollectionText({ ...calendarMatch, score }, { playerStats: [] });
if (!finalText.includes("1:2 Б")) throw new Error("vhl_shootout_notification_missing");
console.log("VHL protocol validation self-test passed");
