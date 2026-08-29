export class HttpRequestLogger {
  constructor(logger) {
    this.logger = logger;
  }

  trackRequest(request, response, pathname) {
    if (!pathname.startsWith("/api/")) return;
    const startedAt = Date.now();
    this.logger.info("http_api_request_received", {
      method: request.method,
      pathname,
      userAgent: request.headers["user-agent"],
      forwardedFor: request.headers["x-forwarded-for"],
    });
    response.once("finish", () => this.#logCompletedRequest(request, response, pathname, startedAt));
  }

  #logCompletedRequest(request, response, pathname, startedAt) {
    this.logger.info("http_api_request_completed", {
      method: request.method,
      pathname,
      statusCode: response.statusCode,
      durationMs: Date.now() - startedAt,
    });
  }
}
