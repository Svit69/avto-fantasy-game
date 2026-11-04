import assert from "node:assert/strict";
import { createMhlGoalieFallbackFixture } from "./mhl-goalie-fallback-test-fixture.js";
import { MhlOfficialGoalieDataSource } from "./MhlOfficialGoalieDataSource.js";
import { MhlMirrorDataSource } from "./MhlMirrorDataSource.js";
import { KhlOnlineGoalieParser } from "./KhlOnlineGoalieParser.js";
import { MhlMirrorDataProvider } from "./MhlMirrorDataProvider.js";
import { createMemoryFactory, players, calendarMatch } from "./mhl-online-test-context.js";
import { OnlineHockeyFailureMessageFactory } from "./OnlineHockeyFailureMessageFactory.js";
import { MhlOfficialGoalieRowsValidator } from "./MhlOfficialGoalieRowsValidator.js";

const { game, content, snapshot } = createMhlGoalieFallbackFixture();
const goalieSource = new MhlOfficialGoalieDataSource(async (url) => {
  assert.equal(url, "https://mhl.khl.ru/pdf/1440/903207/game-903207-ru.pdf"); return new Response("%PDF-synthetic-test");
}, { extractPdfContent: async () => content });
const source = new MhlMirrorDataSource(async () => new Response(JSON.stringify(snapshot)), 1000, goalieSource);
const resolved = await source.loadGame("903207");
const rows = new KhlOnlineGoalieParser("МХК Авто").parseRows(resolved, "A");
assert.equal(rows.find((row) => String(row.number) === "30").saves, 5);
assert.equal(rows.find((row) => String(row.number) === "31").saves, 12);
assert.equal(rows.reduce((sum, row) => sum + row.goalsAgainst, 0), 2);
const allRows = Object.values(resolved.officialGoalieRows).flat(); const validator = new MhlOfficialGoalieRowsValidator();
assert.throws(() => validator.validateRows([...allRows, allRows[0]], resolved), /goalies_missing/);
assert.throws(() => validator.validateRows(allRows.map((row, index) => index ? row : { ...row, name: "Чужой Игрок" }), resolved), /goalie_mismatch/);
assert.throws(() => validator.validateRows(allRows.map((row, index) => index ? row : { ...row, saves: 499 }), resolved), /totals_mismatch/);
const provider = new MhlMirrorDataProvider({ gameId: "903207", players, expectedMatch: calendarMatch, dataSource: source });
const factory = createMemoryFactory();
assert.equal((await factory.createIngestionService(provider).ingestMatch("october", "903207")).ok, true);
const unavailable = new MhlMirrorDataSource(async () => new Response(JSON.stringify(snapshot)), 1000,
  new MhlOfficialGoalieDataSource(async () => new Response("forbidden", { status: 403 })));
await assert.rejects(unavailable.loadGame("903207"), (error) => error.message === "mhl_goalie_protocol_http_403" && Boolean(error.matchIdentity));
const oldWrites = factory.data.writes;
await assert.rejects(factory.createIngestionService(new MhlMirrorDataProvider({ gameId: "903207", players, dataSource: unavailable })).ingestMatch("october", "903207"), /http_403/);
assert.equal(factory.data.writes, oldWrites);
for (const altered of [{ ...content, text: content.text.replace("15 октября", "16 октября") },
  { ...content, text: content.text.replace("7 2", "8 2") }]) {
  await assert.rejects(new MhlOfficialGoalieDataSource(async () => new Response("%PDF-test"), { extractPdfContent: async () => altered }).resolveGoalies(structuredClone(game), "903207"), /identity_mismatch/);
}
await assert.rejects(goalieSource.resolveGoalies({ ...game, gameItem: { status: 10 } }, "903207"), /not_final/);
assert.match(new OnlineHockeyFailureMessageFactory().createMessage("mhl_goalie_protocol_http_403"), /Загрузите протокол/);
console.log("MHL synthetic two-goalie ambiguity, official PDF fallback, unavailable PDF preservation and identity guards self-test passed");
