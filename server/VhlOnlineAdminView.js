export class VhlOnlineAdminView {
  renderMatchList(chatId, matches) {
    const keyboard = matches.slice(0, 20).map((match) => [{
      text: `${this.#formatDate(match.startsAt)} ${match.homeTeam} - ${match.awayTeam}`,
      callback_data: `admin:vhl_online_match:${match.id}`,
    }]);
    return this.#message(chatId, "Выберите матч ВХЛ для привязки online id.", [...keyboard, this.#menuRow()]);
  }

  renderProtocolIdPrompt(chatId, match) {
    const currentId = match.onlineProtocolId ? `\nТекущий id: ${match.onlineProtocolId}` : "";
    return this.#message(chatId, `Матч: ${match.homeTeam} - ${match.awayTeam}${currentId}\nОтправьте id или ссылку online.vhlru.ru.`, [[{ text: "Отменить", callback_data: "admin:cancel" }], this.#menuRow()]);
  }

  renderRegistrationResult(chatId, result) {
    return this.#message(chatId, `Online id ВХЛ сохранён\nМатч: ${result.match.homeTeam} - ${result.match.awayTeam}\nid: ${result.onlineProtocolId}`, [this.#menuRow()]);
  }

  renderInvalidProtocolId(chatId) {
    return this.#message(chatId, "Не удалось распознать id ВХЛ. Отправьте число или ссылку online.vhlru.ru.", [[{ text: "Отменить", callback_data: "admin:cancel" }], this.#menuRow()]);
  }

  #formatDate(value) {
    return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Moscow" }).format(new Date(value));
  }

  #menuRow() {
    return [{ text: "В меню", callback_data: "admin:menu" }];
  }

  #message(chatId, text, inline_keyboard = null) {
    return { method: "sendMessage", chat_id: chatId, text, reply_markup: inline_keyboard ? { inline_keyboard } : undefined };
  }
}
