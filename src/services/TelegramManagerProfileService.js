import { AuthProfileCache } from "./AuthProfileCache.js";
import { TelegramProfileFormatter } from "./TelegramProfileFormatter.js";

export class TelegramManagerProfileService {
  constructor(profileCache = new AuthProfileCache(), formatter = new TelegramProfileFormatter()) {
    Object.assign(this, { profileCache, formatter });
  }

  async loadManagerProfile() {
    const cachedProfile = this.profileCache.loadProfile();
    if (cachedProfile) return cachedProfile;
    const webApp = window.Telegram?.WebApp;
    const telegramProfile = this.formatter.createProfileFromTelegramUser(webApp?.initDataUnsafe?.user);
    if (!webApp?.initData) return telegramProfile;
    return this.#requestVerifiedProfile(webApp.initData, telegramProfile);
  }

  async #requestVerifiedProfile(initData, fallbackProfile) {
    try {
      const response = await fetch(`/api/telegram-auth?stamp=${Date.now()}`, { method: "POST", body: initData });
      if (!response.ok) return fallbackProfile;
      const profile = await response.json(); this.profileCache.saveProfile(profile);
      return profile;
    } catch {
      return fallbackProfile;
    }
  }
}
