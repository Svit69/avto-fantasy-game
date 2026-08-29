const appUrl = process.env.TELEGRAM_WEB_APP_URL || "https://avto-fantasy-game.vercel.app";

export default async function handler(request, response) {
  if (request.method !== "POST") return response.status(405).json({ error: "method_not_allowed" });
  if (!process.env.TELEGRAM_BOT_TOKEN) return response.status(503).json({ error: "telegram_token_missing" });
  const message = request.body?.message;
  const callback = request.body?.callback_query;
  if (callback) await answerAgreement(callback);
  if (message?.contact) await sendMiniAppButton(message.chat.id);
  if (message?.text === "/start") await sendAgreement(message.chat.id);
  response.status(200).json({ ok: true });
}

async function answerAgreement(callback) {
  await callTelegram("answerCallbackQuery", { callback_query_id: callback.id });
  await sendContactRequest(callback.message.chat.id);
}

function sendAgreement(chatId) {
  return callTelegram("sendMessage", { chat_id: chatId, text: "Примите пользовательское соглашение.",
    reply_markup: { inline_keyboard: [[{ text: "Принимаю", callback_data: "accept_terms" }]] } });
}

function sendContactRequest(chatId) {
  return callTelegram("sendMessage", { chat_id: chatId, text: "Поделитесь номером телефона для регистрации.",
    reply_markup: { keyboard: [[{ text: "Поделиться номером", request_contact: true }]], resize_keyboard: true } });
}

function sendMiniAppButton(chatId) {
  return callTelegram("sendMessage", { chat_id: chatId, text: "Регистрация завершена. Откройте Авто Фэнтези.",
    reply_markup: { keyboard: [[{ text: "Открыть приложение", web_app: { url: appUrl } }]], resize_keyboard: true } });
}

function callTelegram(method, payload) {
  return fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
  });
}
