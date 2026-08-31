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
    if (!webApp?.initData) return { authorized: false, profile: telegramProfile };
    return this.#requestVerifiedProfile(webApp.initData, telegramProfile);
  }

  async #requestVerifiedProfile(initData, telegramProfile) {
    try {
      const response = await fetch(`/api/telegram-auth?stamp=${Date.now()}`, { method: "POST", body: initData });
      if (!response.ok) return { authorized: false, profile: telegramProfile };
      const profile = this.#selectDisplayProfile(await response.json(), telegramProfile);
      this.profileCache.saveProfile(profile); return { authorized: true, profile };
    } catch {
      return { authorized: false, profile: telegramProfile };
    }
  }

  #selectDisplayProfile(verifiedProfile, telegramProfile) {
    const telegramName = telegramProfile.managerName;
    const verifiedName = verifiedProfile.managerName || "Менеджер";
    return { managerName: telegramName === "Менеджер" ? verifiedName : telegramName,
      monthlyPlace: verifiedProfile.monthlyPlace || telegramProfile.monthlyPlace };
  }
}
