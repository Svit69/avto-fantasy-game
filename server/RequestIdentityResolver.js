import { TelegramInitDataVerifier } from "./TelegramInitDataVerifier.js";
import { WebLoginTokenService } from "./WebLoginTokenService.js";

export class RequestIdentityResolver {
  constructor(token = process.env.TELEGRAM_BOT_TOKEN) { this.verifier = new TelegramInitDataVerifier(token); this.webTokens = new WebLoginTokenService(token); }
  resolveIdentity(request) {
    try {
      const token = request.headers["x-web-login"] || new URL(request.url, "http://localhost").searchParams.get("web_login");
      const web = this.webTokens.hasSecret() && this.webTokens.verifyToken(token);
      if (web?.userId) return `user:${web.userId}`;
      const params = new URLSearchParams(request.headers["x-telegram-init-data"] || "");
      if (this.verifier.verifyInitData(params)) {
        const user = JSON.parse(params.get("user") || "{}");
        if (user.id) return `user:${user.id}`;
      }
    } catch {}
    const forwarded = process.env.TRUST_PROXY === "true" ? request.headers["x-forwarded-for"]?.split(",")[0]?.trim() : null;
    return `ip:${forwarded || request.socket?.remoteAddress || "unknown"}`;
  }
}
