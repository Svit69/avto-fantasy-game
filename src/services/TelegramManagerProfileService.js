import { AuthProfileCache } from "./AuthProfileCache.js";
import { TelegramAuthorizationService } from "./TelegramAuthorizationService.js";
import { TelegramProfileFormatter } from "./TelegramProfileFormatter.js";

export class TelegramManagerProfileService {
  constructor(profileCache = new AuthProfileCache(), formatter = new TelegramProfileFormatter()) {
    Object.assign(this, { profileCache, formatter });
    this.authorizationService = new TelegramAuthorizationService(profileCache, formatter);
  }

  async loadManagerProfile() {
    const webApp = window.Telegram?.WebApp;
    if (webApp?.initData) return (await this.authorizationService.verifyAuthorization()).profile;
    return this.profileCache.loadProfile() || this.formatter.createProfileFromTelegramUser(webApp?.initDataUnsafe?.user);
  }
}
