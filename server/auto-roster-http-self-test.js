import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { TelegramBotClient } from "./TelegramBotClient.js";
import { createRosterPriceHttpFixture } from "./roster-prices-http-fixture.js";

const fixture = await createRosterPriceHttpFixture(); const original = TelegramBotClient.prototype.callMethod;
TelegramBotClient.prototype.callMethod = async () => ({ ok: true, async json() { return { ok: true }; } });
try {
  const positions = ["нападающий", "нападающий", "нападающий", "защитник", "защитник", "вратарь"];
  const players = ["A", "B", "C"].flatMap((team) => positions.map((position, i) => ({ id: `${team}${i}`, team, position, price: 10, firstName: "Player", lastName: `${team}${i}` })));
  await fs.writeFile(path.join(fixture.directory, "storage/players.json"), JSON.stringify({ players }));
  const tour = fixture.calendar.tours.find((item) => item.id === "next");
  fixture.calendar.matches = ["A", "B", "C"].map((team) => ({ id: `next-${team}`, tourId: "next", startsAt: tour.deadlineAt, featuredTeam: team, homeTeam: team, awayTeam: "Opponent" }));
  await fs.writeFile(path.join(fixture.directory, "storage/calendar.json"), JSON.stringify(fixture.calendar));
  const update = { update_id: 900001, callback_query: { id: "auto-test", data: "roster_auto:next", from: { id: 1 }, message: { chat: { id: 1, type: "private" } } } };
  const submit = async () => {
    const response = await fetch(`${fixture.origin}/api/telegram-webhook`, { method: "POST", headers: { "Content-Type": "application/json", "x-telegram-bot-api-secret-token": process.env.TELEGRAM_WEBHOOK_SECRET || "" }, body: JSON.stringify(update) });
    assert.equal(response.status, 200); return response.json();
  };
  assert.match((await submit()).text, /сохранён/);
  const saved = await fixture.rosterRepository.findRosterByUserAndMonth(1, "next");
  assert.equal(saved.status, "confirmed"); assert.equal(saved.slots.length, 6);
  await submit(); assert.deepEqual(await fixture.rosterRepository.findRosterByUserAndMonth(1, "next"), saved);
  update.update_id++;
  assert.match((await submit()).text, /не изменило/);
  assert.equal(saved.slots.reduce((sum, slot) => sum + slot.lockedPrice, 0), 60);
} finally { TelegramBotClient.prototype.callMethod = original; await fixture.close(); }
console.log("Autofill real webhook routing, persisted roster, update deduplication and repeat click self-test passed");
