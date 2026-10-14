import { RequestAuthorizationHeaderFactory } from "./RequestAuthorizationHeaderFactory.js";

export class CapacityAwareApiRequest {
  constructor(fetcher = fetch, wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))) { Object.assign(this, { fetcher, wait }); }
  async fetchResponse(url, options = {}) {
    const authorization = typeof window === "undefined" ? {} : new RequestAuthorizationHeaderFactory().createAuthorizationHeaders();
    const headers = new Headers(authorization); new Headers(options.headers).forEach((value, key) => headers.set(key, value));
    const requestOptions = { ...options, headers };
    const retryable = ["GET", "HEAD"].includes(options.method || "GET") || /^\/api\/telegram-auth(?:\?|$)/.test(url);
    for (let attempt = 0; ; attempt += 1) {
      const response = await this.fetcher(url, requestOptions);
      if (!retryable || ![429, 503].includes(response.status) || attempt >= 2) return response;
      const seconds = Math.min(10, Math.max(1, Number(response.headers.get("Retry-After")) || 1));
      await response.body?.cancel();
      await this.wait(seconds * 1000 + Math.floor(Math.random() * 500));
    }
  }
}
