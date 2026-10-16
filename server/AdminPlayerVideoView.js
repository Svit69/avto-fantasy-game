export class AdminPlayerVideoView {
  message(chatId, text, rows = [[{ text: "В меню", callback_data: "admin:menu" }]]) {
    return { method: "sendMessage", chat_id: chatId, text, reply_markup: { inline_keyboard: rows } };
  }
  renderRecordings(chatId, players, requestedPage = 0) {
    const recorded = players.filter((player) => player.videoNote?.fileId).sort((a, b) => a.lastName.localeCompare(b.lastName, "ru"));
    const pages = Math.max(1, Math.ceil(recorded.length / 9));
    const page = Math.max(0, Math.min(pages - 1, Number(requestedPage) || 0));
    const rows = recorded.slice(page * 9, (page + 1) * 9).map((player) => [{ text: `${player.lastName} ${player.firstName} · ${player.team}${player.status === "left_game" ? " · ушёл" : ""}`, callback_data: `admin:video_player:${player.id}` }]);
    const navigation = [];
    if (page) navigation.push({ text: "Назад", callback_data: `admin:video_list:${page - 1}` });
    if (page + 1 < pages) navigation.push({ text: "Дальше", callback_data: `admin:video_list:${page + 1}` });
    if (navigation.length) rows.push(navigation);
    rows.push([{ text: "Тест по моему составу", callback_data: "admin:video_test_menu" }], [{ text: "В меню", callback_data: "admin:menu" }]);
    return this.message(chatId, `Кружки хоккеистов: ${recorded.length}\nСтраница ${page + 1}/${pages}`, rows);
  }
  renderPlayer(chatId, player) {
    if (!player) return this.message(chatId, "Игрок не найден.");
    const rows = [[{ text: `${player.firstName} ${player.lastName}`, callback_data: `admin:player:${player.id}` }], [{ text: "Загрузить / заменить кружок", callback_data: `admin:video_upload:${player.id}` }]];
    if (player.videoNote?.fileId) rows.push([{ text: "Удалить кружок", callback_data: `admin:video_delete:${player.id}` }]);
    rows.push([{ text: "Игрок покинул команду", callback_data: `admin:video_leave:${player.id}` }], [{ text: "Записанные кружки", callback_data: "admin:video_list:0" }]);
    if (player.videoNote?.fileId) return { method: "sendVideoNote", chat_id: chatId, video_note: player.videoNote.fileId, reply_markup: { inline_keyboard: rows } };
    return this.message(chatId, `${player.firstName} ${player.lastName}\nКружок пока не загружен.`, rows);
  }
  renderUploadPrompt(chatId, player, error = "") {
    return this.message(chatId, `${error}${player.firstName} ${player.lastName}\nОтправьте следующим сообщением кружок Telegram (не обычное видео). Можно переслать кружок из канала.`,
      [[{ text: "Отмена", callback_data: `admin:video_player:${player.id}` }]]);
  }
  renderConfirmation(chatId, player, action) {
    const deleting = action === "delete";
    return this.message(chatId, `${player.firstName} ${player.lastName}\n${deleting ? "Удалить привязанный кружок?" : "Убрать игрока из игры? Он перестанет участвовать в рассылке кружков и будет недоступен для выбора."}`,
      [[{ text: "Подтвердить", callback_data: `admin:${deleting ? "video_remove" : "leave"}:${player.id}` }], [{ text: "Отмена", callback_data: `admin:video_player:${player.id}` }]]);
  }
}
