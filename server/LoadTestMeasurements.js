export class LoadTestMeasurements {
  constructor() { this.routes = new Map(); }
  record(route, milliseconds, status, bytes) {
    if (!this.routes.has(route)) this.routes.set(route, []);
    this.routes.get(route).push({ milliseconds, status, bytes });
  }
  createReport() {
    return Object.fromEntries([...this.routes].map(([route, records]) => {
      const times = records.map((entry) => entry.milliseconds).sort((first, second) => first - second);
      const successes = records.filter((entry) => entry.status === 200).map((entry) => entry.milliseconds).sort((first, second) => first - second);
      const percentile = (value) => Math.round(times[Math.max(0, Math.ceil(times.length * value) - 1)] || 0);
      return [route, { requests: records.length, successful: records.filter((entry) => entry.status === 200).length,
        backpressure: records.filter((entry) => [429, 503].includes(entry.status)).length,
        errors: records.filter((entry) => entry.status !== 200 && ![429, 503].includes(entry.status)).length,
        p50Ms: percentile(0.5), p95Ms: percentile(0.95), maximumMs: percentile(1),
        successfulP95Ms: successes.length ? Math.round(successes[Math.ceil(successes.length * 0.95) - 1]) : null,
        averageBytes: Math.round(records.reduce((sum, entry) => sum + entry.bytes, 0) / records.length) }];
    }));
  }
}
