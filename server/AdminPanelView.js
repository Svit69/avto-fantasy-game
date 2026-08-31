export class AdminPanelView {
  constructor(keyboardFactory) {
    this.keyboardFactory = keyboardFactory;
    this.pageSize = 9;
  }

  renderMenu(chatId) {
    return this.#message(chatId, "Админ-панель\nВыберите раздел для просмотра или изменения данных.", this.keyboardFactory.createMenuKeyboard());
  }

  renderUsers(chatId, users) {
    const rows = users.slice(-20).map((user) => `${user.name}\nID: ${user.id}\nСтатус: ${user.status}`);
    return this.#message(chatId, `Зарегистрированные пользователи: ${users.length}\n\n${rows.join("\n\n") || "Пока пусто"}`, [[{ text: "В меню", callback_data: "admin:menu" }]]);
  }

  renderPlayers(chatId, players, page) {
    const pages = Math.max(1, Math.ceil(players.length / this.pageSize));
    const text = `База хоккеистов\nСтраница ${page + 1}/${pages}\nНажмите на игрока, чтобы изменить цену или команду.`;
    return this.#message(chatId, text, this.keyboardFactory.createPlayersKeyboard(players, page, this.pageSize));
  }

  renderPlayer(chatId, player) {
    if (!player) return this.renderNotFound(chatId);
    const text = `${player.firstName} ${player.lastName}\nID: ${player.id}\nКоманда: ${player.team}\nПозиция: ${player.position}\nЦена: ${player.price}к`;
    return this.#message(chatId, text, this.keyboardFactory.createPlayerKeyboard(player.id));
  }

  renderPricePrompt(chatId, player) {
    return this.#message(chatId, `Введите новую цену для ${player.lastName} целым числом.\nНапример: 18`);
  }

  renderTeamPrompt(chatId, player) {
    return this.#message(chatId, `Выберите команду для ${player.lastName} или введите название текстом.`, this.keyboardFactory.createTeamKeyboard(player.id));
  }

  renderOperationResult(chatId, player, action) {
    if (!player) return this.renderNotFound(chatId);
    return this.#message(chatId, `${action}\n${player.firstName} ${player.lastName}\n${player.team}, ${player.price}к`, this.keyboardFactory.createPlayerKeyboard(player.id));
  }

  renderInvalidCommand(chatId) { return this.#message(chatId, "Не удалось применить изменение. Проверьте значение и попробуйте ещё раз."); }
  renderAccessDenied(chatId) { return this.#message(chatId, "Нет доступа к админ-панели."); }
  renderNotFound(chatId) { return this.#message(chatId, "Игрок не найден.", [[{ text: "К списку хоккеистов", callback_data: "admin:players:0" }]]); }

  #message(chatId, text, inline_keyboard = null) {
    return { method: "sendMessage", chat_id: chatId, text, reply_markup: inline_keyboard ? { inline_keyboard } : undefined };
  }
}
