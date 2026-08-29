import crypto from "node:crypto";

export default function handler(request, response) {
  if (request.method !== "POST") return response.status(405).json({ error: "method_not_allowed" });
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return response.status(503).json({ error: "telegram_token_missing" });
  const params = new URLSearchParams(typeof request.body === "string" ? request.body : "");
  if (!isValidTelegramInitData(params, token)) return response.status(401).json({ error: "invalid_init_data" });
  const user = JSON.parse(params.get("user") || "{}");
  response.status(200).json({ managerName: createManagerName(user), monthlyPlace: "—" });
}

function isValidTelegramInitData(params, token) {
  const hash = params.get("hash");
  params.delete("hash");
  const data = [...params.entries()].sort().map(([key, value]) => `${key}=${value}`).join("\n");
  const secret = crypto.createHmac("sha256", "WebAppData").update(token).digest();
  const expected = crypto.createHmac("sha256", secret).update(data).digest("hex");
  const actual = Buffer.from(hash || "", "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return actual.length === expectedBuffer.length && crypto.timingSafeEqual(actual, expectedBuffer);
}

function createManagerName(user) {
  return [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || "Менеджер";
}
