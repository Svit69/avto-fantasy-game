import assert from "node:assert/strict";
import { fixture } from "./khl-online-test-context.js";
import { KhlMirrorDataSource } from "./KhlMirrorDataSource.js";
import { KhlMirrorCaptureDecoder } from "./KhlMirrorCaptureDecoder.js";

const asset = { kind: "asset", path: "/game.json", body: Buffer.from(JSON.stringify({ status: "success", data: { game: fixture } })).toString("base64") };
const snapshot = { kind: "snapshot", id: "902107", capturedAt: new Date().toISOString(), resources: {
  "https://www.khl.ru/rest/game/text/": { path: "/game.json", type: "application/json" } } };
const stream = [asset, { kind: "heartbeat" }, snapshot].map((event) => JSON.stringify(event)).join("\n");
let request;
const source = new KhlMirrorDataSource(async (url, options) => {
  request = { url, options };
  const bytes = new TextEncoder().encode(stream);
  return new Response(new ReadableStream({ start(controller) {
    for (let offset = 0; offset < bytes.length; offset += 57) controller.enqueue(bytes.slice(offset, offset + 57));
    controller.close();
  } }));
});
assert.equal((await source.loadGame("902107")).teams.home.name, "Автомобилист");
assert.equal(request.options.method, "POST"); assert.match(request.url, /id=902107$/);
await assert.rejects(() => source.loadGame("../../etc"), /invalid_game_id/);
const capture = new KhlMirrorCaptureDecoder(); capture.acceptEvent(asset);
assert.throws(() => capture.readGame("902107"), /snapshot_missing/);
capture.acceptEvent({ ...snapshot, capturedAt: "2000-01-01T00:00:00Z" });
assert.throws(() => capture.readGame("902107"), /snapshot_stale/);
assert.throws(() => capture.acceptEvent({ kind: "error", code: "CAPTURE_FAILED" }), /CAPTURE_FAILED/);
await assert.rejects(() => new KhlMirrorDataSource(async () => new Response("", { status: 503 })).loadGame("902107"), /http_503/);
await assert.rejects(() => new KhlMirrorDataSource(async () => new Response(JSON.stringify(asset))).loadGame("902107"), /snapshot_missing/);
await assert.rejects(() => new KhlMirrorDataSource(async () => new Response("{invalid}\n")).loadGame("902107"), SyntaxError);
const wrong = new KhlMirrorCaptureDecoder(); wrong.acceptEvent(asset); wrong.acceptEvent({ ...snapshot, id: "902108" });
assert.throws(() => wrong.readGame("902107"), /snapshot_missing/);
console.log("KHL mirror streaming UTF-8, truncation, source failures and snapshot identity self-test passed");
