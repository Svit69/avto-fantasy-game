import fs from "node:fs/promises";
import path from "node:path";
import http from "node:http";
import { ServerApplicationFactory } from "./ServerApplicationFactory.js";
import { StorageDriverFactory } from "./StorageDriverFactory.js";
import { WebLoginTokenService } from "./WebLoginTokenService.js";
import { createRosterPriceFixture } from "./roster-prices-test-fixture.js";

export async function createRosterPriceHttpFixture() {
  const fixture = await createRosterPriceFixture();
  const overrides = { STORAGE_DRIVER: "json", TELEGRAM_BOT_TOKEN: "price-test-secret", USER_DATABASE_PATH: "storage/users.json",
    ROSTER_DATABASE_PATH: "storage/rosters.json", PLAYER_DATABASE_PATH: "storage/players.json", CALENDAR_DATABASE_PATH: "storage/calendar.json",
    NOTIFICATION_DATABASE_PATH: "storage/notifications.json", KHL_DATABASE_PATH: "storage/matches.json" };
  const previous = Object.fromEntries(Object.keys(overrides).map((key) => [key, process.env[key]])); Object.assign(process.env, overrides);
  await fs.mkdir(path.join(fixture.directory, "storage"), { recursive: true });
  for (const [name, value] of Object.entries({ users: { users: [{ id: "1", status: "active", name: "Manager" }] },
    players: { players: fixture.players }, calendar: fixture.calendar })) await fs.writeFile(path.join(fixture.directory, `storage/${name}.json`), JSON.stringify(value));
  const logger = { info() {}, warn() {}, error() {} };
  const application = new ServerApplicationFactory(fixture.directory, logger).createApplication();
  const server = http.createServer((request, response) => application.handleRequest(request, response));
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const headers = { "Content-Type": "application/json", "x-web-login": new WebLoginTokenService(overrides.TELEGRAM_BOT_TOKEN).createToken(1) };
  return { ...fixture, logger, headers, origin, storage: new StorageDriverFactory((file) => path.join(fixture.directory, file)),
    close: async () => { server.closeAllConnections(); await new Promise((resolve) => server.close(resolve));
      for (const [key, value] of Object.entries(previous)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
      await fixture.close(); } };
}
