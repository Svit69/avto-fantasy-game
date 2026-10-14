export class RosterSubmissionFlow {
  async submitRoster(button, submit) {
    if (button.disabled) return;
    button.disabled = true;
    try { await submit(); }
    catch (error) {
      const message = [429, 503].includes(error?.statusCode)
        ? `Сервер занят. Выбранные игроки остались на экране. Повторите сохранение через ${error.retryAfter || 5} сек.`
        : "Не удалось подтвердить сохранение состава. Выбранные игроки остались на экране. Повторите сохранение.";
      if (window.Telegram?.WebApp?.showAlert) window.Telegram.WebApp.showAlert(message);
      else window.alert(message);
    } finally { button.disabled = false; }
  }
}
