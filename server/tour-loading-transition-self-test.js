import assert from "node:assert/strict";
import { RosterMonthTransitionController } from "../src/controllers/RosterMonthTransitionController.js";
import { RosterFactory } from "../src/services/RosterFactory.js";
import { FooterView } from "../src/views/FooterView.js";

const factory = new RosterFactory(); const teamRoster = factory.createEmptyRoster("confirmed");
const pending = new Map(); let month = "past"; let html;
const controller = new RosterMonthTransitionController({ teamRoster, rosterFactory: factory, getSelectedMonth: () => month,
  rosterDomRenderer: { renderRosterSections() { html = new FooterView().render(teamRoster); } },
  loadRoster: (value) => new Promise((resolve, reject) => { pending.set(value, { resolve, reject }); }) });
const first = controller.loadSelectedMonth();
assert.equal(teamRoster.isEditable(), false); assert.match(html, /ЗАГРУЖАЕМ СОСТАВ/); assert.ok(!html.includes("data-open-standings"));
month = "next"; const second = controller.loadSelectedMonth();
const confirmed = factory.createEmptyRoster("confirmed"); confirmed.setTourAccessState({ month: "next", isOpen: true, isLocked: false });
pending.get("next").resolve(confirmed); await second;
assert.match(html, /РЕДАКТИРОВАТЬ СОСТАВ/);
pending.get("past").resolve(factory.createEmptyRoster("locked")); await first;
assert.match(html, /РЕДАКТИРОВАТЬ СОСТАВ/); assert.equal(teamRoster.getTourAccessState().month, "next");
month = "closed"; const failed = controller.loadSelectedMonth(); pending.get("closed").reject(new Error("offline")); await failed;
assert.equal(teamRoster.isEditable(), false); assert.match(html, /data-retry-roster-load/); assert.ok(!html.includes("data-open-standings"));
const retry = controller.loadSelectedMonth();
const closed = factory.createEmptyRoster("locked"); closed.setTourAccessState({ month: "closed", isOpen: false, isLocked: false });
pending.get("closed").resolve(closed); await retry;
assert.match(html, /ТУР ПОКА НЕДОСТУПЕН/); assert.equal(teamRoster.isEditable(), false);
const select = new EventTarget(); let click; let rosterLoads = 0; let statsLoads = 0;
controller.rootElement = { querySelector: () => select, addEventListener(_type, listener) { click = listener; } };
controller.loadSelectedMonth = async () => { rosterLoads++; };
controller.connect(); select.addEventListener("change", () => { statsLoads++; });
click({ target: { closest: () => ({}) } });
assert.equal(rosterLoads, 1); assert.equal(statsLoads, 1);
console.log("Tour month response reordering, immediate edit blocking, retry and future tour state self-test passed");
