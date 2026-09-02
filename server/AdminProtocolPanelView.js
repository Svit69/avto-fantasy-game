export class AdminProtocolPanelView {
  constructor(keyboardFactory) { this.keyboardFactory = keyboardFactory; }

  renderLeaguePrompt(chatId) {
    return this.#message(chatId, "Загрузка протокола матча\nВыберите лигу, затем отправьте PDF-протокол матча.", this.keyboardFactory.createLeagueKeyboard());
  }

  renderFilePrompt(chatId, league) {
    return this.#message(chatId, `Лига: ${league}\nОтправьте PDF-протокол матча документом. Имя файла может быть вида game-898099-ru.pdf.`, this.keyboardFactory.createProtocolWaitingKeyboard());
  }

  renderInvalidFile(chatId) {
    return this.#message(chatId, "Нужен PDF-файл протокола матча. Отправьте файл документом ещё раз.", this.keyboardFactory.createProtocolWaitingKeyboard());
  }

  renderCancelled(chatId) { return this.#message(chatId, "Загрузка протокола отменена.", [[{ text: "В меню", callback_data: "admin:menu" }]]); }

  renderImportFailed(chatId) {
    return this.#message(chatId, "Не удалось обработать протокол. Проверьте PDF и попробуйте ещё раз.", [[{ text: "В меню", callback_data: "admin:menu" }]]);
  }

  renderImportResult(chatId, result) {
    const match = result.match;
    const rows = result.playerStats.map((stat) => `${stat.playerName || stat.playerId}: ${stat.fantasyPoints} ФО`).join("\n");
    return this.#message(chatId, `Протокол обработан\n${match.homeTeam} - ${match.awayTeam}\n${match.scheduledAt || "Дата не найдена"}\n\nФО игроков:\n${rows || "Нет привязанных игроков"}`, [[{ text: "В меню", callback_data: "admin:menu" }]]);
  }

  #message(chatId, text, inline_keyboard = null) {
    return { method: "sendMessage", chat_id: chatId, text, reply_markup: inline_keyboard ? { inline_keyboard } : undefined };
  }
}
