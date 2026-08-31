export class AuthRequiredModalView {
  constructor(botUrl = "https://t.me/avto_fantasy_bot?start=auth") {
    this.botUrl = botUrl;
  }

  render() {
    return `
      <div class="auth-modal-backdrop" role="presentation"></div>
      <section class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <img src="/assets/avto_logo.png" alt="" />
        <p class="auth-kicker">Требуется авторизация</p>
        <h2 id="auth-title">Войдите через Telegram</h2>
        <p>Откройте бота, завершите регистрацию и запустите мини-приложение из Telegram.</p>
        <a class="auth-action" href="${this.botUrl}" target="_blank" rel="noopener">Открыть Telegram-бота</a>
        <small>После авторизации вернитесь в приложение или откройте его заново из бота.</small>
      </section>
    `;
  }
}
