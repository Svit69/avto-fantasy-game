import { performance } from "node:perf_hooks";
import { LoadTestMeasurements } from "./LoadTestMeasurements.js";

export class VirtualUserLoadRunner {
  async runSessions(server, { sessions, concurrency, thinkMs }) {
    const measurements = new LoadTestMeasurements(); let next = 0; const started = performance.now();
    const paths = [["menu", `/api/standings?summary=1&month=${encodeURIComponent(server.month)}`],
      ["table", `/api/standings?limit=50&offset=0&month=${encodeURIComponent(server.month)}`], ["roster", `/api/roster?month=${encodeURIComponent(server.month)}`]];
    const count = Math.min(sessions, server.tokens.length);
    await Promise.all(Array.from({ length: Math.min(concurrency, count) }, async () => {
      while (true) {
        const index = next++; if (index >= count) break;
        const token = server.tokens[index];
        for (const [route, path] of paths) {
          const start = performance.now(); let status = 0; let bytes = 0;
          try {
            const response = await fetch(`${server.origin}${path}`, { headers: { "x-web-login": token }, signal: AbortSignal.timeout(15000) });
            status = response.status; bytes = (await response.arrayBuffer()).byteLength;
          } catch { status = 0; }
          measurements.record(route, performance.now() - start, status, bytes);
          if (thinkMs) await new Promise((resolve) => setTimeout(resolve, thinkMs));
        }
      }
    }));
    const durationMs = Math.round(performance.now() - started);
    const health = await fetch(`${server.origin}/api/health`, { signal: AbortSignal.timeout(15000) });
    await health.arrayBuffer();
    return { activeSessions: count, concurrency: Math.min(concurrency, count), durationMs, healthAfterLoad: health.status, routes: measurements.createReport() };
  }
}
