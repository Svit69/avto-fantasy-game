import { MhlOnlineHtmlParser } from "./MhlOnlineHtmlParser.js";

export class MhlMirrorCaptureDecoder {
  #snapshot;
  acceptEvent(event) {
    if (event.kind === "error") throw new Error(`mhl_mirror_${event.code || "capture_failed"}`);
    if (event.kind === "snapshot") this.#snapshot = event;
  }
  readGame(gameId) {
    const snapshot = this.#snapshot;
    if (String(snapshot?.id) !== String(gameId) || snapshot.league !== "mhl") throw new Error("mhl_mirror_snapshot_missing");
    const source = new URL(snapshot.sourceUrl);
    if (source.protocol !== "https:" || source.hostname !== "text.mhl.khl.ru" || source.pathname !== `/${gameId}.html`) throw new Error("mhl_mirror_source_mismatch");
    const age = Date.now() - Date.parse(snapshot.capturedAt);
    if (!Number.isFinite(age) || age < -60000 || age > 600000) throw new Error("mhl_mirror_snapshot_stale");
    if (typeof snapshot.html !== "string" || snapshot.html.length > 8388608) throw new Error("mhl_mirror_html_missing");
    return new MhlOnlineHtmlParser().parseGame(snapshot.html, gameId);
  }
}
