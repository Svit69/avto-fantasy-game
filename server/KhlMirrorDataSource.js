import { KhlMirrorCaptureDecoder } from "./KhlMirrorCaptureDecoder.js";

export class KhlMirrorDataSource {
  constructor(fetcher = (...args) => fetch(...args), timeoutMs = 300000) { Object.assign(this, { fetcher, timeoutMs }); }
  async loadGame(gameId) {
    if (!/^[1-9]\d{0,9}$/.test(String(gameId))) throw new Error("khl_invalid_game_id");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    let reader;
    try {
      const response = await this.fetcher(`https://avto-box.vercel.app/api/capture?id=${gameId}`, {
        method: "POST", cache: "no-store", signal: controller.signal,
      });
      if (!response.ok) throw new Error(`khl_mirror_http_${response.status}`);
      reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8", { fatal: true });
      const capture = new KhlMirrorCaptureDecoder();
      let pending = ""; let received = 0;
      while (true) {
        const { value, done } = await reader.read();
        received += value?.length || 0;
        if (received > 33554432) throw new Error("khl_mirror_response_too_large");
        pending += decoder.decode(value, { stream: !done });
        let newline;
        while ((newline = pending.indexOf("\n")) >= 0) {
          const line = pending.slice(0, newline); pending = pending.slice(newline + 1);
          if (line.trim()) capture.acceptEvent(JSON.parse(line));
        }
        if (pending.length > 8388608) throw new Error("khl_mirror_line_too_large");
        if (done) break;
      }
      if (pending.trim()) capture.acceptEvent(JSON.parse(pending));
      return capture.readGame(gameId);
    } finally { clearTimeout(timer); await reader?.cancel().catch(() => {}); reader?.releaseLock(); }
  }
}
