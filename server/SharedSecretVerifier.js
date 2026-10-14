import crypto from "node:crypto";

export class SharedSecretVerifier {
  matches(actual, expected) {
    if (!expected || typeof actual !== "string") return false;
    const supplied = Buffer.from(actual); const secret = Buffer.from(expected);
    return supplied.length === secret.length && crypto.timingSafeEqual(supplied, secret);
  }
}
