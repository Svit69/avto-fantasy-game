export class TelegramManagerProfileService {
  async loadManagerProfile() {
    const webApp = window.Telegram?.WebApp;
    webApp?.ready();
    const telegramProfile = this.#createProfileFromUser(webApp?.initDataUnsafe?.user);
    if (!webApp?.initData) return telegramProfile;
    return this.#requestVerifiedProfile(webApp.initData, telegramProfile);
  }

  async #requestVerifiedProfile(initData, telegramProfile) {
    try {
      const response = await fetch("/api/telegram-auth", { method: "POST", body: initData });
      if (!response.ok) return telegramProfile;
      return this.#mergeVerifiedProfile(await response.json(), telegramProfile);
    } catch {
      return telegramProfile;
    }
  }

  #mergeVerifiedProfile(verifiedProfile, telegramProfile) {
    const telegramName = telegramProfile.managerName;
    return {
      managerName: telegramName === "Менеджер" ? verifiedProfile.managerName : telegramName,
      monthlyPlace: verifiedProfile.monthlyPlace || telegramProfile.monthlyPlace,
    };
  }

  #createProfileFromUser(user) {
    if (!user) return this.#createFallbackProfile();
    const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || this.#formatUsername(user.username);
    return { managerName: name || "Менеджер", monthlyPlace: "—" };
  }

  #formatUsername(username) {
    return username ? `@${username}` : "";
  }

  #createFallbackProfile() {
    return { managerName: "Менеджер", monthlyPlace: "—" };
  }
}
