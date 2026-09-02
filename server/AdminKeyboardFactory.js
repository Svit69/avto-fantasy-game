export class AdminKeyboardFactory {
  createMenuKeyboard() {
    return [[{ text: "Зарегистрированные пользователи", callback_data: "admin:users" }],
      [{ text: "База хоккеистов", callback_data: "admin:players:0" }],
      [{ text: "Загрузить протокол матча", callback_data: "admin:protocol" }]];
  }

  createLeagueKeyboard() {
    return [[{ text: "КХЛ", callback_data: "admin:protocol_league:КХЛ" }],
      [{ text: "ВХЛ", callback_data: "admin:protocol_league:ВХЛ" }],
      [{ text: "МХЛ", callback_data: "admin:protocol_league:МХЛ" }],
      [{ text: "В меню", callback_data: "admin:menu" }]];
  }

  createProtocolWaitingKeyboard() {
    return [[{ text: "Отменить загрузку", callback_data: "admin:cancel" }],
      [{ text: "В меню", callback_data: "admin:menu" }]];
  }

  createPlayersKeyboard(players, page, pageSize) {
    const offset = page * pageSize;
    const playerRows = players.slice(offset, offset + pageSize).map((player) => [
      { text: `${player.lastName} · ${player.price}к · ${player.team}`, callback_data: `admin:player:${player.id}` },
    ]);
    return [...playerRows, this.#createPaginationRow(page, players.length, pageSize), [{ text: "В меню", callback_data: "admin:menu" }]];
  }

  createPlayerKeyboard(playerId) {
    return [[{ text: "Изменить цену", callback_data: `admin:price:${playerId}` }],
      [{ text: "Изменить команду", callback_data: `admin:team:${playerId}` }],
      [{ text: "Игрок покинул игру", callback_data: `admin:leave:${playerId}` }],
      [{ text: "К списку хоккеистов", callback_data: "admin:players:0" }]];
  }

  createTeamKeyboard(playerId) {
    return [[{ text: "Автомобилист", callback_data: `admin:set_team:${playerId}:avto` }],
      [{ text: "Горняк-УГМК", callback_data: `admin:set_team:${playerId}:gornyak` }],
      [{ text: "МХК Авто", callback_data: `admin:set_team:${playerId}:mhk_auto` }],
      [{ text: "Ввести другую команду", callback_data: `admin:custom_team:${playerId}` }]];
  }

  #createPaginationRow(page, total, pageSize) {
    const row = [];
    if (page > 0) row.push({ text: "Назад", callback_data: `admin:players:${page - 1}` });
    if ((page + 1) * pageSize < total) row.push({ text: "Дальше", callback_data: `admin:players:${page + 1}` });
    return row.length ? row : [{ text: "Обновить", callback_data: `admin:players:${page}` }];
  }
}
