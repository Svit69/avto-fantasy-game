import { load } from "cheerio";
import { html } from "./mhl-online-test-context.js";
import { MhlOnlineRosterParser } from "./MhlOnlineRosterParser.js";
import { MhlOnlineHtmlParser } from "./MhlOnlineHtmlParser.js";

export function createMhlGoalieFallbackFixture() {
  const document = load(html); const roster = new MhlOnlineRosterParser().parseRoster(document);
  roster.A[30].ig = 1;
  document("script:not([src])").filter((index, node) => /\bgamePlayers\s*=/.test(document(node).text()))
    .text(`let gamePlayers = JSON.parse(${JSON.stringify(JSON.stringify(roster))});`);
  const changedHtml = document.html(); let game;
  try { new MhlOnlineHtmlParser().parseGame(changedHtml, "903207"); }
  catch (error) { if (error.message !== "mhl_goalie_change_ambiguous") throw error; game = error.matchIdentity; }
  if (!game) throw Error("fixture_did_not_reproduce_goalie_ambiguity");
  const point = (text, x, y) => ({ text, x, y });
  const row = (number, name, total, y) => [point(String(number), 20, y), point("вр", 50, y), point(name, 70, y), point(total, 300, y)];
  const pages = [[point("Авто", 100, 665), point("Спутник", 400, 665), point("Авто", 100, 500), point("Время на площадке", 200, 510),
    ...row(30, "Горбунов Сергей В.", "1-6", 480), ...row(31, "Минаев Ефим", "1-13", 470),
    point("Спутник", 100, 300), point("Время на площадке", 200, 310), ...row(72, "Тычкин Данил", "7-57", 280)]];
  const content = { pages, text: "15 октября 2026\nНачало матча: 18:30\n7 2" };
  const snapshot = { kind: "snapshot", id: "903207", league: "mhl", sourceUrl: "https://text.mhl.khl.ru/903207.html",
    capturedAt: new Date().toISOString(), html: changedHtml };
  return { game, content, changedHtml, snapshot };
}
