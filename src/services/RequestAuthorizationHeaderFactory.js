export class RequestAuthorizationHeaderFactory {
  constructor(webTokenKey = "avto-fantasy-web-login") {
    this.webTokenKey = webTokenKey;
  }

  createAuthorizationHeaders() {
    const telegramInitData = window.Telegram?.WebApp?.initData;
    if (telegramInitData) return { "x-telegram-init-data": telegramInitData };
    const webToken = sessionStorage.getItem(this.webTokenKey);
    return webToken ? { "x-web-login": webToken } : {};
  }

  createJsonHeaders() {
    return { "Content-Type": "application/json; charset=utf-8", ...this.createAuthorizationHeaders() };
  }
}
