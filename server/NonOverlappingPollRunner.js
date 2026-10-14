export class NonOverlappingPollRunner {
  #running = false;
  #stopped = false;
  #timer;
  constructor(task, intervalMs, onError = console.error) { Object.assign(this, { task, intervalMs, onError }); }
  async runOnce() {
    if (this.#running) return { skipped: true };
    this.#running = true;
    try { return await this.task(); } finally { this.#running = false; }
  }
  start() {
    this.#stopped = false;
    const next = async () => {
      try { await this.runOnce(); } catch (error) { this.onError(error); }
      if (!this.#stopped) this.#timer = setTimeout(next, this.intervalMs);
    };
    this.#timer = setTimeout(next, this.intervalMs);
  }
  stop() { this.#stopped = true; clearTimeout(this.#timer); }
}
