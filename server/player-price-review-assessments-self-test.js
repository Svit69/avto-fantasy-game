import assert from "node:assert/strict";
import { PlayerPriceReviewTestFixtures } from "./PlayerPriceReviewTestFixtures.js";
import { PlayerPriceReviewService } from "./PlayerPriceReviewService.js";
import { AdminPriceReviewPlayerView } from "./AdminPriceReviewPlayerView.js";
import { AdminPriceReviewView } from "./AdminPriceReviewView.js";

const fixtures = new PlayerPriceReviewTestFixtures();
const scenario = fixtures.createScenario();
scenario.players.push({ ...scenario.players[0], id: "without-matches", lastName: "Без матчей" },
  { ...scenario.players[0], id: "two-matches", lastName: "Два матча" }, { ...scenario.players[0], id: "three-matches", lastName: "Три матча" });
scenario.database.playerStats.push(...scenario.database.matches.slice(0, 2).map((match) => ({ playerId: "two-matches", matchId: match.id, fantasyPoints: 20 })),
  ...scenario.database.matches.slice(0, 3).map((match) => ({ playerId: "three-matches", matchId: match.id, fantasyPoints: 20 })));
const report = await new PlayerPriceReviewService(fixtures.createRepositories(scenario)).createReviewReport();
assert.equal(report.counts.no_data, 1);
assert.equal(report.counts.short_history, 1);
assert.equal(report.playerAssessments.length, report.total);
assert.equal(report.playerAssessments.find((item) => item.player.id === "two-matches").reason, "insufficient");
assert.equal(report.playerAssessments.find((item) => item.player.id === "three-matches").reason, "unchanged");
const view = new AdminPriceReviewPlayerView();
const text = view.renderPlayers(1, report).text;
assert(text.includes("Нет сыгранных матчей") && text.includes("Предварительная статистика"));
const expanded = { ...report, playerAssessments: Array.from({ length: 21 }, () => report.playerAssessments[0]) };
assert(view.renderPlayers(1, expanded, 99).text.includes("Страница 3/3"));
assert(view.renderPlayers(1, expanded, -5).text.includes("Страница 1/3"));
assert(view.renderPlayers(1, expanded).text.length < 4096);
const summary = new AdminPriceReviewView().renderReport(1, report);
assert(summary.text.includes("Без матчей за сезон: 1") && summary.text.includes("учтены в расчёте"));
assert(summary.reply_markup.inline_keyboard.flat().some((button) => button.callback_data === "admin:price_review_players:0"));
console.log("Player price review assessments self-test passed");
