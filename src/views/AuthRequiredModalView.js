export class AuthRequiredModalView {
  constructor(botUrl = "https://t.me/avto_fantasy_bot?start=auth") {
    this.botUrl = botUrl;
  }

  render(status) {
    return `
      <div class="auth-modal-backdrop" role="presentation"></div>
      <section class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <img src="/assets/avto_logo.png" alt="" />
        <p class="auth-kicker">Требуется авторизация</p>
        <h2 id="auth-title">Откройте через Telegram</h2>
        <p>${this.#formatMessage(status?.reason)}</p>
        <a class="auth-action" href="${this.botUrl}" target="_blank" rel="noopener">Перейти в Telegram-бота</a>
        <small>${this.#formatHint(status?.reason)}</small>
      </section>
    `;
  }

  #formatMessage(reason) {
    if (reason === "invalid_init_data") return "Telegram не подтвердил подпись запуска. Откройте мини-приложение заново из бота.";
    if (reason === "network_error") return "Не удалось проверить авторизацию. Проверьте соединение и откройте приложение заново.";
    return "Регистрация в боте уже может быть пройдена, но приложение должно быть запущено именно кнопкой Mini App внутри Telegram.";
  }

  #formatHint(reason) {
    return reason ? `Причина: ${reason}` : "После регистрации нажмите кнопку запуска приложения в сообщении бота.";
  }
}
