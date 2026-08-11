export function TelegramLoginStatus({ authorizedUser, isTelegramRuntime }) {
  const message = resolveTelegramStatusMessage(authorizedUser, isTelegramRuntime);

  return <p className="telegram-status">{message}</p>;
}

function resolveTelegramStatusMessage(authorizedUser, isTelegramRuntime) {
  if (authorizedUser) {
    return `Вход через Telegram: ${authorizedUser.name}`;
  }

  return isTelegramRuntime
    ? "Ожидание данных аккаунта Telegram"
    : "Запустите приложение через Telegram бота для входа";
}
