export class TelegramGateway {
  #telegram;

  constructor(runtimeWindow) {
    this.#telegram = runtimeWindow.Telegram?.WebApp ?? null;
    this.#telegram?.ready();
    this.#telegram?.expand();
  }

  isTelegramRuntime() {
    return Boolean(this.#telegram);
  }

  getAuthorizedUser() {
    const user = this.#telegram?.initDataUnsafe?.user;

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: [user.first_name, user.last_name].filter(Boolean).join(" "),
      username: user.username,
    };
  }
}
