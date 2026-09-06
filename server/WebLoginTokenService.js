import crypto from "node:crypto";

export class WebLoginTokenService {
  constructor(secret, ttlMs = 24 * 60 * 60 * 1000) {
    Object.assign(this, { secret, ttlMs });
  }

  hasSecret() {
    return Boolean(this.secret);
  }

  createToken(userId, now = Date.now()) {
    const payload = this.#encode({ userId: String(userId), exp: now + this.ttlMs });
    return `${payload}.${this.#sign(payload)}`;
  }

  verifyToken(token, now = Date.now()) {
    try {
      const [payload, signature] = String(token || "").split(".");
      if (!payload || !signature || this.#sign(payload) !== signature) return null;
      const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
      return Number(data.exp) >= now ? data : null;
    } catch { return null; }
  }

  #encode(payload) {
    return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  }

  #sign(payload) {
    return crypto.createHmac("sha256", this.secret || "").update(payload).digest("base64url");
  }
}
