import { PlayerVideoNoteSelector } from "./PlayerVideoNoteSelector.js";
import { AdminPlayerVideoView } from "./AdminPlayerVideoView.js";
export class AdminPlayerVideoTestController {
  constructor({ calendarRepository, rosterRepository, playerCatalogRepository, view = new AdminPlayerVideoView(), selector = new PlayerVideoNoteSelector() }) {
    Object.assign(this, { calendarRepository, rosterRepository, playerCatalogRepository, view, selector });
  }
  async executeRoute({ route, chatId, userId }) {
    const calendar = await this.calendarRepository.listCalendar();
    const tours = [...(calendar.tours || [])].sort((a, b) => Date.parse(b.deadlineAt) - Date.parse(a.deadlineAt));
    if (route.type === "video_test_menu") return this.view.message(chatId, "Тест кружка · Выберите тур своего сохранённого состава. Дедлайн не учитывается, пользователям ничего не отправляется.",
      [...tours.map((tour) => [{ text: tour.name || tour.title || tour.month, callback_data: `admin:video_test_tour:${tour.id}` }]), [{ text: "Назад", callback_data: "admin:video_list:0" }]]);
    const tour = tours.find((item) => item.id === route.playerId);
    if (!tour) return this.view.message(chatId, "Тур не найден.");
    const roster = await this.rosterRepository.findRosterByUserAndMonth(userId, tour.month);
    const players = await this.playerCatalogRepository.listPlayers();
    const player = this.selector.selectPlayer(roster, players, tour.id, userId);
    if (!player) return this.view.message(chatId, "Нужен сохранённый состав из шести разных игроков, хотя бы у одного из которых есть кружок. Либо откройте отдельную запись в разделе кружков.");
    return { method: "sendVideoNote", chat_id: userId, video_note: player.videoNote.fileId,
      reply_markup: { inline_keyboard: [[{ text: `Тест · ${player.lastName}`, callback_data: "admin:video_list:0" }]] } };
  }
}
