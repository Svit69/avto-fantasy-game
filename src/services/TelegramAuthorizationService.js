import { AuthProfileCache } from "./AuthProfileCache.js";
import { TelegramProfileFormatter } from "./TelegramProfileFormatter.js";

export class TelegramAuthorizationService {
  constructor(profileCache = new AuthProfileCache(), formatter = new TelegramProfileFormatter()) {
    Object.assign(this, { profileCache, formatter });
  }

  async verifyAuthorization() {
    const webApp = window.Telegram?.WebApp;
    webApp?.ready();
    const telegramProfile = this.formatter.createProfileFromTelegramUser(webApp?.initDataUnsafe?.user);
    if (!webApp?.initData) return { authorized: false, reason: "no_telegram_context", profile: telegramProfile };
    return this.#requestVerifiedProfile(webApp.initData, telegramProfile);
  }

  async #requestVerifiedProfile(initData, telegramProfile) {
    try {
      const response = await fetch(`/api/telegram-auth?stamp=${Date.now()}`, { method: "POST", body: initData });
      if (!response.ok) return { authorized: false, reason: "invalid_init_data", profile: telegramProfile };
      const profile = this.#selectDisplayProfile(await response.json(), telegramProfile);
      this.profileCache.saveProfile(profile); return { authorized: true, profile };
    } catch {
      return { authorized: false, reason: "network_error", profile: telegramProfile };
    }
  }

  #selectDisplayProfile(verifiedProfile, telegramProfile) {
    const verifiedName = verifiedProfile.managerName || "Менеджер";
    if (this.formatter.isFallbackProfile(telegramProfile)) return { ...verifiedProfile, managerName: verifiedName };
    return { ...verifiedProfile, managerName: telegramProfile.managerName };
  }
}
