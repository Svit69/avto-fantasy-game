export class HttpApplication {
  constructor(controllers) {
    Object.assign(this, controllers);
  }

  async handleRequest(request, response) {
    try {
      await this.#routeRequest(request, response);
    } catch (error) {
      this.logger.error("http_request_failed", { method: request.method, url: request.url, errorName: error.name, errorMessage: error.message });
      if (response.headersSent || response.destroyed) return;
      if ([408, 413].includes(error.statusCode)) response.setHeader("Connection", "close");
      if (error.retryAfter) response.setHeader("Retry-After", String(error.retryAfter));
      this.jsonResponder.sendJson(response, error.statusCode || 500, { error: error.statusCode ? error.message : "internal_server_error" });
    }
  }

  async #routeRequest(request, response) {
    const url = new URL(request.url, `http://${request.headers.host}`);
    this.requestLogger.trackRequest(request, response, url.pathname);
    if (url.pathname === "/api/telegram-auth") return this.authController.handleRequest(request, response);
    if (url.pathname === "/api/telegram-webhook") return this.webhookController.handleRequest(request, response);
    if (url.pathname === "/api/telegram-set-webhook") return this.webhookInstaller.handleRequest(request, response);
    if (url.pathname === "/api/telegram-webhook-info") return this.webhookInfo.handleRequest(request, response);
    if (url.pathname === "/api/telegram-bot-info") return this.botInfo.handleRequest(request, response);
    if (url.pathname.startsWith("/api/khl/matches/")) return this.khlMatchDataController.handleRequest(request, response, url);
    if (url.pathname === "/api/internal/khl/import") return this.khlManualImportController.handleRequest(request, response);
    if (url.pathname === "/api/calendar") return this.calendarController.handleRequest(request, response, url);
    if (url.pathname === "/api/opponents") return this.opponentTeamController.handleRequest(request, response);
    if (url.pathname === "/api/player-tour-stats") return this.playerTourStatsController.handleRequest(request, response, url);
    if (url.pathname === "/api/players") return this.playerCatalogController.handleRequest(request, response);
    if (url.pathname === "/api/player-selection-stats") return this.playerSelectionStatsController.handleRequest(request, response);
    if (url.pathname === "/api/roster") return this.rosterController.handleRequest(request, response);
    if (url.pathname === "/api/standings") return this.standingsController.handleRequest(request, response);
    if (url.pathname === "/api/health") return this.healthController.handleRequest(request, response);
    return this.staticFileServer.serveFile(url.pathname, response, url.search);
  }
}
