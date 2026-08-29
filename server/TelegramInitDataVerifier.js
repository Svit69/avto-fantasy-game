import crypto from "node:crypto";

export class TelegramInitDataVerifier {
  constructor(token) {
    this.token = token;
  }

  hasToken() {
    return Boolean(this.token);
  }

  verifyInitData(params) {
    if (!this.token) return false;
    const hash = params.get("hash");
    params.delete("hash");
    const dataCheckString = [...params.entries()].sort().map(([key, value]) => `${key}=${value}`).join("\n");
    const secret = crypto.createHmac("sha256", "WebAppData").update(this.token).digest();
    const expected = crypto.createHmac("sha256", secret).update(dataCheckString).digest("hex");
    return this.#compareHashes(hash, expected);
  }

  #compareHashes(actualHash, expectedHash) {
    const actual = Buffer.from(actualHash || "", "hex");
    const expected = Buffer.from(expectedHash, "hex");
    return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
  }
}
