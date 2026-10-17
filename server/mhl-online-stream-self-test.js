import assert from "node:assert/strict";
import { html } from "./mhl-online-test-context.js";
import { MhlMirrorDataSource } from "./MhlMirrorDataSource.js";
import { MhlMirrorCaptureDecoder } from "./MhlMirrorCaptureDecoder.js";

const snapshot = { kind: "snapshot", id: "903207", league: "mhl", sourceUrl: "https://text.mhl.khl.ru/903207.html",
  capturedAt: new Date().toISOString(), html };
const text = [JSON.stringify({ kind: "heartbeat" }), JSON.stringify(snapshot)].join("\n");
let attempts = 0;
const source = new MhlMirrorDataSource(async (url, options) => {
  assert.match(url, /\/api\/mhl\?id=903207$/); assert.equal(options.method, "POST");
  if (++attempts === 1) return new Response('{"kind":"error","code":"CAPTURE_FAILED"}\n');
  const bytes = new TextEncoder().encode(text);
  return new Response(new ReadableStream({ start(controller) {
    for (let offset = 0; offset < bytes.length; offset += 257) controller.enqueue(bytes.slice(offset, offset + 257));
    controller.close();
  } }));
});
await assert.rejects(() => source.loadGame("903207"), /CAPTURE_FAILED/);
const game = await source.loadGame("903207");
assert.equal(attempts, 2); assert.equal(game.teams.home.name, "МХК Авто");
for (const [overrides, reason] of [
  [{ id: "903208" }, /snapshot_missing/], [{ league: "khl" }, /snapshot_missing/],
  [{ sourceUrl: "https://text.khl.ru/903207.html" }, /source_mismatch/],
  [{ sourceUrl: "https://text.mhl.khl.ru/903208.html" }, /source_mismatch/],
  [{ capturedAt: "2000-01-01T00:00:00Z" }, /snapshot_stale/], [{ html: null }, /html_missing/],
]) {
  const decoder = new MhlMirrorCaptureDecoder(); decoder.acceptEvent({ ...snapshot, ...overrides });
  assert.throws(() => decoder.readGame("903207"), reason);
}
await assert.rejects(() => new MhlMirrorDataSource(async () => new Response('{"kind":"heartbeat"}\n')).loadGame("903207"), /snapshot_missing/);
await assert.rejects(() => source.loadGame("../../bad"), /invalid_game_id/);
const timeout = new MhlMirrorDataSource(async (url, options) => new Response(new ReadableStream({ start(controller) {
  options.signal.addEventListener("abort", () => controller.error(new Error("test_capture_timeout")));
} })), 20);
await assert.rejects(() => timeout.loadGame("903207"), /test_capture_timeout/);
console.log("MHL mirror retry, streaming UTF-8, timeout and source identity self-test passed");
