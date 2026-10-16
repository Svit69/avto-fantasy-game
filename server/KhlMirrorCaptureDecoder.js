export class KhlMirrorCaptureDecoder {
  #assets = new Map();
  #snapshot;
  acceptEvent(event) {
    if (event.kind === "error") throw new Error(`khl_mirror_${event.code || "capture_failed"}`);
    if (event.kind === "asset" && /^[\s]*[\[{]/.test(Buffer.from(event.body.slice(0, 80), "base64").toString("utf8"))) {
      this.#assets.set(event.path, Buffer.from(event.body, "base64").toString("utf8"));
    }
    if (event.kind === "snapshot") this.#snapshot = event;
  }
  readGame(gameId) {
    const snapshot = this.#snapshot;
    if (String(snapshot?.id) !== String(gameId)) throw new Error("khl_mirror_snapshot_missing");
    const age = Date.now() - Date.parse(snapshot.capturedAt);
    if (!Number.isFinite(age) || age < -60000 || age > 600000) throw new Error("khl_mirror_snapshot_stale");
    const resource = Object.entries(snapshot.resources || {}).find(([url]) => new URL(url).pathname === "/rest/game/text/");
    const content = resource && this.#assets.get(resource[1].path);
    if (!content) throw new Error("khl_mirror_game_resource_missing");
    const payload = JSON.parse(content);
    if (payload.status !== "success" || String(payload.data?.game?.info?.data?.id) !== String(gameId)) {
      throw new Error("khl_mirror_game_identity_mismatch");
    }
    return payload.data.game;
  }
}
