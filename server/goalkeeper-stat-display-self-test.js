import assert from "node:assert/strict";
import { PlayerMatchStatRowFactory } from "../src/views/PlayerMatchStatRowFactory.js";
import { PlayerMatchResultDetailView } from "../src/views/PlayerMatchResultDetailView.js";
import { GoalkeeperFantasyScoringRulebook } from "../src/scoring/GoalkeeperFantasyScoringRulebook.js";
import { GoalkeeperFantasyPointsCalculator } from "../src/scoring/GoalkeeperFantasyPointsCalculator.js";

const goalkeeper = { getPosition: () => "вратарь" };
const factory = new PlayerMatchStatRowFactory();
assert.deepEqual(factory.createRows(goalkeeper, { assists: 1 }), [{ label: "1 передача", points: 30 }]);
assert.deepEqual(factory.createRows(goalkeeper, { goals: 1 }), [{ label: "1 гол", points: 100 }]);
assert.deepEqual(factory.createRows(goalkeeper, { assists: "2", goals: "3" }), [
  { label: "2 передачи", points: 60 }, { label: "3 гола", points: 300 }
]);
assert.deepEqual(factory.createRows(goalkeeper, {}), []);
assert.deepEqual(factory.createRows(goalkeeper, { goals: 0, assists: 0 }), []);
const stats = { saves: 27, goalsAgainst: 1, penalties: 1, assists: 1, goals: 1 };
const rows = factory.createRows(goalkeeper, stats);
assert.equal(rows.length, 5);
assert.equal(rows.reduce((sum, row) => sum + row.points, 0), new GoalkeeperFantasyScoringRulebook().calculateRawFantasyPoints(stats));
const fantasyPoints = new GoalkeeperFantasyPointsCalculator().calculateMatchFantasyPoints({ league: "МХЛ", events: stats });
const match = { homeTeam: "МХК Авто", awayTeam: "Соперник", playerMatchStats: { ...stats, homeScore: 3, awayScore: 2, fantasyPoints } };
const before = structuredClone(match);
const html = new PlayerMatchResultDetailView().render(goalkeeper, match, "/home.png", "/away.png");
assert.match(html, /<dt>1 передача<\/dt><dd>30 ФО<\/dd>/);
assert.match(html, /<dt>1 гол<\/dt><dd>100 ФО<\/dd>/);
assert.ok(html.includes(`<dt>Итого</dt><dd>${fantasyPoints} ФО</dd>`));
assert.deepEqual(match, before);
const forwardRows = factory.createRows({ getPosition: () => "нападающий" }, { goals: 1, assists: 2 });
assert.deepEqual(forwardRows, [{ label: "1 гол", points: 50 }, { label: "2 передачи", points: 60 }]);
const defenderRows = factory.createRows({ getPosition: () => "защитник" }, { goals: 1, assists: 1 });
assert.deepEqual(defenderRows, [{ label: "1 гол", points: 60 }, { label: "1 передача", points: 40 }]);
console.log("Goalkeeper match goals, assists, declension, rulebook parity and unchanged totals self-test passed");
