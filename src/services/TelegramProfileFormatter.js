export class TelegramProfileFormatter {
  createProfileFromTelegramUser(user) {
    if (!user) return this.createFallbackProfile();
    const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || this.#formatUsername(user.username);
    return { managerName: name || "Менеджер", monthlyPlace: "—" };
  }

  createFallbackProfile() {
    return { managerName: "Менеджер", monthlyPlace: "—" };
  }

  #formatUsername(username) {
    return username ? `@${username}` : "";
  }
}
