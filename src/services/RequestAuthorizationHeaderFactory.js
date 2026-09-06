export class RequestAuthorizationHeaderFactory {
  constructor(webTokenKey = "avto-fantasy-web-login") {
    this.webTokenKey = webTokenKey;
  }

  createAuthorizationHeaders() {
    const webToken = sessionStorage.getItem(this.webTokenKey);
    if (webToken) return { "x-web-login": webToken };
    const telegramInitData = window.Telegram?.WebApp?.initData;
    return telegramInitData ? { "x-telegram-init-data": telegramInitData } : {};
  }

  createJsonHeaders() {
    return { "Content-Type": "application/json; charset=utf-8", ...this.createAuthorizationHeaders() };
  }
}
