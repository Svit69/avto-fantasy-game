import { AdminPlayerDirectory } from "./AdminPlayerDirectory.js";
export class AdminPlayerDirectoryView {
  constructor(directory = new AdminPlayerDirectory()) { this.directory = directory; }
  renderTeams(chatId, players) {
    const rows = this.directory.listTeams(players).map((team) => [{ text: team.name, callback_data: `admin:player_team:${team.code}` }]);
    return this.#message(chatId, "База хоккеистов · Команда", [...rows, [{ text: "В меню", callback_data: "admin:menu" }]]);
  }
  renderPositions(chatId, players, teamCode) {
    const team = this.directory.listTeams(players).find((item) => item.code === teamCode);
    if (!team) return this.renderTeams(chatId, players);
    const rows = Object.entries(this.directory.positions).map(([code, name]) => [{ text: name, callback_data: `admin:player_group:${teamCode}:${code}:0` }]);
    return this.#message(chatId, `${team.name} · Позиция`, [...rows, [{ text: "Команды", callback_data: "admin:players:0" }]]);
  }
  renderPlayers(chatId, players, teamCode, value = "all:0") {
    const [position, rawPage] = value.split(":");
    const selected = this.directory.selectPlayers(players, teamCode, position);
    const pages = Math.max(1, Math.ceil(selected.length / 9));
    const page = Math.max(0, Math.min(pages - 1, Number(rawPage) || 0));
    const rows = selected.slice(page * 9, (page + 1) * 9).map((player) => [{ text: `${player.lastName} ${player.firstName} · ${player.price}к${player.videoNote?.fileId ? " · кружок" : ""}${player.status === "left_game" ? " · ушёл" : ""}`, callback_data: `admin:player:${player.id}` }]);
    const navigation = [];
    if (page) navigation.push({ text: "Назад", callback_data: `admin:player_group:${teamCode}:${position}:${page - 1}` });
    if (page + 1 < pages) navigation.push({ text: "Дальше", callback_data: `admin:player_group:${teamCode}:${position}:${page + 1}` });
    if (navigation.length) rows.push(navigation);
    rows.push([{ text: "Позиции", callback_data: `admin:player_team:${teamCode}` }]);
    return this.#message(chatId, `Хоккеисты · ${page + 1}/${pages}${selected.length ? "" : "\nНет игроков"}`, rows);
  }
  #message(chatId, text, rows) { return { method: "sendMessage", chat_id: chatId, text, reply_markup: { inline_keyboard: rows } }; }
}
