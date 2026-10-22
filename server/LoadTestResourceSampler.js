import { monitorEventLoopDelay } from "node:perf_hooks";

export class LoadTestResourceSampler {
  constructor() {
    this.startedAt = Date.now(); this.cpu = process.cpuUsage(); this.maximumRss = process.memoryUsage().rss;
    this.histogram = monitorEventLoopDelay({ resolution: 20 }); this.histogram.enable();
    this.timer = setInterval(() => { this.maximumRss = Math.max(this.maximumRss, process.memoryUsage().rss); }, 100); this.timer.unref();
  }
  readSample() {
    const memory = process.memoryUsage(); const cpu = process.cpuUsage(this.cpu);
    return { peakServerRssMb: Math.round(Math.max(this.maximumRss, memory.rss) / 1048576), heapMb: Math.round(memory.heapUsed / 1048576),
      cpuMs: Math.round((cpu.user + cpu.system) / 1000), elapsedMs: Date.now() - this.startedAt,
      eventLoopP95Ms: Math.round(this.histogram.percentile(95) / 1000000) };
  }
  close() { clearInterval(this.timer); this.histogram.disable(); }
}
