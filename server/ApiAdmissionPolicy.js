import { RequestIdentityResolver } from "./RequestIdentityResolver.js";
import { OperationalSettings as Settings } from "./OperationalSettings.js";

export class ApiAdmissionPolicy {
  #buckets = new Map();
  #active = { read: 0, write: 0, webhook: 0 };
  constructor(identityResolver = new RequestIdentityResolver(), clock = Date.now) { Object.assign(this, { identityResolver, clock }); }
  admitRequest(request, pathname) {
    const category = pathname === "/api/telegram-webhook" ? "webhook" : ["GET", "HEAD"].includes(request.method) ? "read" : "write";
    const maximum = Settings.readNumber(`API_${category.toUpperCase()}_CONCURRENCY`, { read: 8, write: 2, webhook: 4 }[category], 1, 100)
      + (category === "webhook" ? 0 : Settings.readNumber(`API_${category.toUpperCase()}_QUEUE_SIZE`, category === "read" ? 32 : 8, 0, 100));
    if (this.#active[category] >= maximum) return { statusCode: 503, error: "server_busy", retryAfter: 5 };
    if (category !== "webhook") {
      const identity = this.identityResolver.resolveIdentity(request);
      const key = `${category}:${identity}`; const now = this.clock();
      if (this.#buckets.size >= 5000) for (const [id, bucket] of this.#buckets) if (now - bucket.updatedAt > 60000) this.#buckets.delete(id);
      if (!this.#buckets.has(key) && this.#buckets.size >= 5000) return { statusCode: 503, error: "server_busy", retryAfter: 10 };
      const anonymous = identity.startsWith("ip:");
      const name = `API_${anonymous ? "ANONYMOUS_" : ""}${category.toUpperCase()}_PER_MINUTE`;
      const perMinute = Settings.readNumber(name, anonymous ? (category === "write" ? 120 : 3000) : (category === "write" ? 30 : 180));
      const burst = anonymous ? (category === "write" ? 60 : 200) : 20;
      const previous = this.#buckets.get(key) || { tokens: burst, updatedAt: now };
      const tokens = Math.min(burst, previous.tokens + Math.max(0, now - previous.updatedAt) * perMinute / 60000);
      this.#buckets.set(key, { tokens: tokens >= 1 ? tokens - 1 : tokens, updatedAt: now });
      if (tokens < 1) return { statusCode: 429, error: "rate_limit_exceeded", retryAfter: Math.ceil(60000 / perMinute) };
    }
    this.#active[category] += 1; let released = false;
    return { release: () => { if (!released) { this.#active[category] -= 1; released = true; } } };
  }
  readStatus() { return { ...this.#active, rateLimitKeys: this.#buckets.size }; }
}
