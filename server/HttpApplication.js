export class HttpApplication {
  constructor({ staticFileServer, jsonResponder, authController, webhookController, webhookInstaller, webhookInfo, requestLogger, healthController, botInfo }) {
    this.staticFileServer = staticFileServer;
    this.jsonResponder = jsonResponder;
    this.authController = authController;
    this.webhookController = webhookController;
    this.webhookInstaller = webhookInstaller;
    this.webhookInfo = webhookInfo;
    this.requestLogger = requestLogger;
    this.healthController = healthController;
    this.botInfo = botInfo;
  }

  async handleRequest(request, response) {
    try {
      await this.#routeRequest(request, response);
    } catch (error) {
      console.error(error);
      this.jsonResponder.sendJson(response, 500, { error: "internal_server_error" });
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
    if (url.pathname === "/api/health") return this.healthController.handleRequest(request, response);
    return this.staticFileServer.serveFile(url.pathname, response);
  }
}
