export class TelegramManagerProfileService {
  async loadManagerProfile() {
    const webApp = window.Telegram?.WebApp;
    webApp?.ready();
    if (!webApp?.initData) return this.#createFallbackProfile();
    return this.#requestVerifiedProfile(webApp.initData, webApp.initDataUnsafe?.user);
  }

  async #requestVerifiedProfile(initData, fallbackUser) {
    try {
      const response = await fetch("/api/telegram-auth", { method: "POST", body: initData });
      if (!response.ok) return this.#createProfileFromUser(fallbackUser);
      return response.json();
    } catch {
      return this.#createProfileFromUser(fallbackUser);
    }
  }

  #createProfileFromUser(user) {
    if (!user) return this.#createFallbackProfile();
    const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username;
    return { managerName: name || "Менеджер", monthlyPlace: "—" };
  }

  #createFallbackProfile() {
    return { managerName: "Менеджер", monthlyPlace: "—" };
  }
}
