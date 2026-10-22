import http from "node:http";
import path from "node:path";
import crypto from "node:crypto";
import { once } from "node:events";
import { SyntheticLoadFixture } from "./SyntheticLoadFixture.js";
import { createOperationsTestWorkspace } from "./operations-test-workspace.js";
import { ServerApplicationFactory } from "./ServerApplicationFactory.js";
import { WebLoginTokenService } from "./WebLoginTokenService.js";
import { LoadTestResourceSampler } from "./LoadTestResourceSampler.js";

if (!process.send) throw new Error("Load server must run as an isolated child process");
const count = Number(process.argv[2]); if (!Number.isSafeInteger(count) || count < 1 || count > 5000) throw new Error("Invalid user count");
const workspace = await createOperationsTestWorkspace(); const fixture = new SyntheticLoadFixture(); const data = fixture.createData(count);
Object.assign(process.env, { STORAGE_DRIVER: "json", TELEGRAM_BOT_TOKEN: crypto.randomUUID(), RUNTIME_STATE_DIRECTORY: path.join(workspace.directory, "runtime"),
  USER_DATABASE_PATH: "storage/users.json", ROSTER_DATABASE_PATH: "storage/rosters.json", PLAYER_DATABASE_PATH: "storage/players.json",
  CALENDAR_DATABASE_PATH: "storage/calendar.json", KHL_DATABASE_PATH: "storage/khl-match-data.json", NOTIFICATION_DATABASE_PATH: "storage/notifications.json" });
await fixture.writeFixture(workspace.directory, data);
const application = new ServerApplicationFactory(workspace.directory, { info() {}, warn() {}, error() {} }).createApplication();
const sampler = new LoadTestResourceSampler();
const server = http.createServer((request, response) => application.handleRequest(request, response));
server.listen(0, "127.0.0.1"); await once(server, "listening");
const tokens = new WebLoginTokenService(process.env.TELEGRAM_BOT_TOKEN);
process.send({ type: "ready", origin: `http://127.0.0.1:${server.address().port}`, month: data.month,
  tokens: data.users.map((user) => tokens.createToken(user.id)), players: data.players.length, matches: data.database.matches.length });
let closing = false;
const close = async () => {
  if (closing) return; closing = true; sampler.close(); server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve)); await workspace.close(); process.exit(0);
};
process.on("message", (message) => { if (message.type === "sample") process.send({ type: "sample", reportBuilds: application.application.standingsController.reports.builds, ...sampler.readSample() }); if (message.type === "stop") void close(); });
process.on("disconnect", () => void close()); process.on("SIGTERM", () => void close());
