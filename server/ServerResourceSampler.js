import fs from "node:fs/promises";
import os from "node:os";
import { monitorEventLoopDelay } from "node:perf_hooks";
import { LinuxResourceParser } from "./LinuxResourceParser.js";

export class ServerResourceSampler {
  #previous;
  constructor(rootDirectory) {
    this.rootDirectory = rootDirectory; this.parser = new LinuxResourceParser();
    this.delay = monitorEventLoopDelay({ resolution: 20 }); this.delay.enable();
  }
  async readSample() {
    const now = Date.now();
    let sample = { availableMemoryBytes: os.freemem(), totalMemoryBytes: os.totalmem(), cpuPercent: null, swapPagesPerSecond: null };
    if (process.platform === "linux") {
      const memory = this.parser.parseMemory(await fs.readFile("/proc/meminfo", "utf8"));
      const cpu = this.parser.parseCpu(await fs.readFile("/proc/stat", "utf8"));
      const swap = this.parser.parseSwapActivity(await fs.readFile("/proc/vmstat", "utf8"));
      sample = { ...memory, cpuPercent: this.#previous && cpu.total > this.#previous.cpu.total
        ? 100 * (1 - (cpu.idle - this.#previous.cpu.idle) / (cpu.total - this.#previous.cpu.total)) : null,
        swapPagesPerSecond: this.#previous ? (swap - this.#previous.swap) / Math.max(1, (now - this.#previous.time) / 1000) : 0 };
      this.#previous = { cpu, swap, time: now };
    }
    const disk = await fs.statfs(this.rootDirectory);
    const eventLoopP95Ms = this.delay.percentile(95) / 1000000; this.delay.reset();
    return { ...sample, time: now, rssBytes: process.memoryUsage().rss, freeDiskPercent: 100 * disk.bavail / disk.blocks, eventLoopP95Ms };
  }
  close() { this.delay.disable(); }
}
