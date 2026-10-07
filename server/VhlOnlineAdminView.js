export class VhlOnlineAdminView {
  renderMonthList(chatId, months) {
    const keyboard = months.map((month) => [{ text: this.#formatMonth(month), callback_data: `admin:vhl_online_month:${month}` }]);
    return this.#message(chatId, months.length ? "Выберите месяц матчей ВХЛ." : "Матчей ВХЛ в календаре нет.", [...keyboard, this.#menuRow()]);
  }

  renderMatchList(chatId, month, matches) {
    const keyboard = matches.map((match) => [{
      text: `${this.#formatDate(match.startsAt)} ${match.homeTeam} - ${match.awayTeam}`,
      callback_data: `admin:vhl_online_match:${match.id}`,
    }]);
    return this.#message(chatId, `${this.#formatMonth(month)}. Выберите матч ВХЛ для привязки online id.`, [...keyboard,
      [{ text: "К месяцам", callback_data: "admin:vhl_online" }], this.#menuRow()]);
  }

  #formatMonth(month) {
    const label = new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${month}-01T00:00:00Z`));
    return label[0].toUpperCase() + label.slice(1);
  }

  renderProtocolIdPrompt(chatId, match) {
    const currentId = match.onlineProtocolId ? `\nТекущий id: ${match.onlineProtocolId}` : "";
    return this.#message(chatId, `Матч: ${match.homeTeam} - ${match.awayTeam}${currentId}\nОтправьте id или ссылку online.vhlru.ru.`, [[{ text: "Отменить", callback_data: "admin:cancel" }], this.#menuRow()]);
  }

  renderRegistrationResult(chatId, result) {
    const status = result.verificationStatus === "pending" ? "Страница пока недоступна. Перед сбором данных проверим команды и дату." : "Матч проверен по странице ВХЛ.";
    return this.#message(chatId, `Online id ВХЛ сохранён\nМатч: ${result.match.homeTeam} - ${result.match.awayTeam}\nid: ${result.onlineProtocolId}\n${status}`, [this.#menuRow()]);
  }

  renderInvalidProtocolId(chatId) {
    return this.#message(chatId, "Не удалось проверить ID ВХЛ: страница другого матча или ошибка загрузки. Проверьте номер и выберите матч снова.", [[{ text: "В меню", callback_data: "admin:menu" }]]);
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
