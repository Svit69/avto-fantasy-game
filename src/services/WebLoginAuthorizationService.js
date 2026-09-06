export class WebLoginAuthorizationService {
  constructor(profileCache, tokenKey = "avto-fantasy-web-login") {
    Object.assign(this, { profileCache, tokenKey });
  }

  async verifyAuthorizationFromUrl() {
    const token = new URLSearchParams(window.location.search).get("web_login");
    if (!token) return null;
    try {
      const response = await fetch(`/api/telegram-auth?web_login=${encodeURIComponent(token)}&stamp=${Date.now()}`, { cache: "no-store" });
      this.#removeTokenFromUrl();
      if (!response.ok) return this.#createRejectedStatus("invalid_web_login");
      const profile = await response.json();
      sessionStorage.setItem(this.tokenKey, token);
      this.profileCache.saveProfile(profile);
      return { authorized: true, profile };
    } catch {
      return { authorized: false, reason: "network_error" };
    }
  }

  #createRejectedStatus(reason) {
    sessionStorage.removeItem(this.tokenKey);
    return { authorized: false, reason };
  }

  #removeTokenFromUrl() {
    const url = new URL(window.location.href);
    url.searchParams.delete("web_login");
    window.history.replaceState({}, "", url.pathname + url.search + url.hash);
  }
}
