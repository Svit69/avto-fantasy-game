export class KhlSensitiveHeaderSanitizer {
  constructor() { this.blockedNames = new Set(["cookie", "set-cookie", "authorization", "proxy-authorization", "x-api-key"]); }

  sanitizeHeaders(headers = []) {
    return headers.filter((header) => !this.blockedNames.has(String(header.name || "").toLowerCase()));
  }

  sanitizeHar(har) {
    const entries = har.log?.entries || [];
    return { ...har, log: { ...har.log, entries: entries.map((entry) => this.#sanitizeEntry(entry)) } };
  }

  #sanitizeEntry(entry) {
    const request = { ...entry.request, headers: this.sanitizeHeaders(entry.request?.headers) };
    const response = { ...entry.response, headers: this.sanitizeHeaders(entry.response?.headers) };
    return { ...entry, request, response };
  }
}
