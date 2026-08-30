export class AdminPanelView {
  renderMenu(chatId) {
    return this.#message(chatId, "Админ-панель Авто Фэнтези", [[
      { text: "Пользователи", callback_data: "admin:users" },
      { text: "Хоккеисты", callback_data: "admin:players" },
    ]]);
  }

  renderUsers(chatId, users) {
    const rows = users.slice(-20).map((user) => `${user.id} · ${user.name} · ${user.status}`);
    return this.#message(chatId, `Зарегистрированные пользователи: ${users.length}\n\n${rows.join("\n") || "Пока пусто"}`);
  }

  renderPlayers(chatId, players) {
    const rows = players.map((player) => `${player.id} · ${player.lastName} · ${player.team} · ${player.price}к`);
    const help = "Цена: /set_price id 18\nКоманда: /set_team id Автомобилист";
    return this.#message(chatId, `Хоккеисты: ${players.length}\n\n${rows.slice(0, 35).join("\n")}\n\n${help}`);
  }

  renderOperationResult(chatId, player, action) {
    if (!player) return this.#message(chatId, "Игрок не найден.");
    return this.#message(chatId, `${action}: ${player.firstName} ${player.lastName}\n${player.team}, ${player.price}к`);
  }

  renderInvalidCommand(chatId) {
    return this.#message(chatId, "Команда заполнена неверно. Пример: /set_price golyshev 18");
  }

  renderAccessDenied(chatId) {
    return this.#message(chatId, "Нет доступа к админ-панели.");
  }

  #message(chatId, text, inline_keyboard = null) {
    return { method: "sendMessage", chat_id: chatId, text, reply_markup: inline_keyboard ? { inline_keyboard } : undefined };
  }
}
