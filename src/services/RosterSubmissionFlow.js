export class RosterSubmissionFlow {
  async submitRoster(button, submit) {
    if (button.disabled) return;
    button.disabled = true;
    try { await submit(); }
    catch (error) {
      const priceMessage = ["roster_budget_exceeded", "roster_prices_changed"].includes(error?.message)
        ? "Цены игроков изменились. Откройте приложение заново, проверьте актуальную стоимость и сохраните состав в пределах 90к." : null;
      const message = priceMessage || ([429, 503].includes(error?.statusCode)
        ? `Сервер занят. Выбранные игроки остались на экране. Повторите сохранение через ${error.retryAfter || 5} сек.`
        : "Не удалось подтвердить сохранение состава. Выбранные игроки остались на экране. Повторите сохранение.");
      if (window.Telegram?.WebApp?.showAlert) window.Telegram.WebApp.showAlert(message);
      else window.alert(message);
    } finally { button.disabled = false; }
  }
}
