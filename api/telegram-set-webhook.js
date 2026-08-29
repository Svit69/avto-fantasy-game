export default async function handler(request, response) {
  if (request.method !== "POST") return response.status(405).json({ error: "method_not_allowed" });
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const url = process.env.TELEGRAM_WEBHOOK_URL;
  if (!token || !url) return response.status(503).json({ error: "telegram_env_missing" });
  const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  response.status(telegramResponse.ok ? 200 : 502).json(await telegramResponse.json());
}
