export class TelegramBotClient {
  constructor(token) {
    this.token = token;
  }

  hasToken() {
    return Boolean(this.token);
  }

  callMethod(method, payload) {
    return fetch(`https://api.telegram.org/bot${this.token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }
}
