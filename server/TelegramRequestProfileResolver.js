export class TelegramRequestProfileResolver {
  constructor({ initDataVerifier, webLoginTokenService, userRepository }) {
    Object.assign(this, { initDataVerifier, webLoginTokenService, userRepository });
  }

  async resolveProfile(request, payload = {}) {
    return this.#resolveTelegramProfile(request, payload) || await this.#resolveWebProfile(request);
  }

  #resolveTelegramProfile(request, payload) {
    try {
      const initData = payload.initData || request.headers["x-telegram-init-data"] || "";
      if (!this.initDataVerifier.hasToken() || !initData) return null;
      const params = new URLSearchParams(initData);
      return this.initDataVerifier.verifyInitData(params) ? JSON.parse(params.get("user") || "{}") : null;
    } catch { return null; }
  }

  async #resolveWebProfile(request) {
    const token = request.headers["x-web-login"] || this.#getQueryToken(request);
    const payload = this.webLoginTokenService.verifyToken(token);
    const user = payload && await this.userRepository.findUserById(payload.userId);
    return user?.status === "active" ? { id: user.id, first_name: user.name } : null;
  }

  #getQueryToken(request) {
    return new URL(request.url, `http://${request.headers.host}`).searchParams.get("web_login");
  }
}
