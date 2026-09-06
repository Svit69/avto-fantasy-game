import { AuthProfileCache } from "./AuthProfileCache.js";
import { StandingsApiClient } from "./StandingsApiClient.js";
import { TelegramAuthorizationService } from "./TelegramAuthorizationService.js";
import { TelegramProfileFormatter } from "./TelegramProfileFormatter.js";

export class TelegramManagerProfileService {
  constructor(profileCache = new AuthProfileCache(), formatter = new TelegramProfileFormatter(), standingsApiClient = new StandingsApiClient()) {
    Object.assign(this, { profileCache, formatter, standingsApiClient });
    this.authorizationService = new TelegramAuthorizationService(profileCache, formatter);
  }

  async loadManagerProfile(month) {
    const profile = await this.#loadBaseProfile();
    return { ...profile, monthlyPlace: await this.#loadCurrentPlace(month) };
  }

  async #loadBaseProfile() {
    const webApp = window.Telegram?.WebApp;
    if (webApp?.initData) return (await this.authorizationService.verifyAuthorization()).profile;
    return this.profileCache.loadProfile() || this.formatter.createProfileFromTelegramUser(webApp?.initDataUnsafe?.user);
  }

  async #loadCurrentPlace(month) {
    try {
      return (await this.standingsApiClient.loadMonthlyStandings(month)).currentUser?.place || "—";
    } catch { return "—"; }
  }
}
