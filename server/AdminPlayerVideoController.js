import { AdminPlayerVideoView } from "./AdminPlayerVideoView.js";
export class AdminPlayerVideoController {
  constructor({ playerCatalogRepository, stateStore, testController, view = new AdminPlayerVideoView() }) {
    Object.assign(this, { playerCatalogRepository, stateStore, testController, view });
  }
  async executeRoute(source) {
    const { route, chatId, userId } = source;
    if (String(chatId) !== String(userId)) return this.view.message(chatId, "Управление кружками доступно в личном чате с ботом.");
    this.stateStore.clearState(chatId);
    if (route.type.startsWith("video_test")) return this.testController.executeRoute(source);
    if (route.type === "video_list") return this.view.renderRecordings(chatId, await this.playerCatalogRepository.listPlayers(), route.page);
    const player = await this.playerCatalogRepository.findPlayerById(route.playerId);
    if (!player) return this.view.message(chatId, "Игрок не найден.");
    if (route.type === "video_upload") {
      this.stateStore.waitForPlayerVideoNote(chatId, player.id);
      return this.view.renderUploadPrompt(chatId, player);
    }
    if (["video_delete", "video_leave"].includes(route.type)) return this.view.renderConfirmation(chatId, player, route.type === "video_delete" ? "delete" : "leave");
    if (route.type === "video_remove") {
      await this.playerCatalogRepository.updatePlayerVideoNote(player.id, null);
      return this.view.message(chatId, `Кружок ${player.lastName} удалён.`, [[{ text: "Назад", callback_data: `admin:video_player:${player.id}` }]]);
    }
    return this.view.renderPlayer(chatId, player);
  }
  async handlePendingInput(source) {
    const { chatId, userId, pending, videoNote } = source;
    const player = await this.playerCatalogRepository.findPlayerById(pending.playerId);
    if (!player || String(chatId) !== String(userId)) return this.view.message(chatId, "Загрузка отменена.");
    if (!videoNote?.file_id || !videoNote.file_unique_id || !Number.isFinite(videoNote.duration) || videoNote.duration < 1 || videoNote.duration > 60) {
      this.stateStore.waitForPlayerVideoNote(chatId, player.id);
      return this.view.renderUploadPrompt(chatId, player, "Не получен корректный кружок длительностью до минуты.\n");
    }
    await this.playerCatalogRepository.updatePlayerVideoNote(player.id, { fileId: videoNote.file_id, fileUniqueId: videoNote.file_unique_id,
      duration: videoNote.duration, length: videoNote.length, uploadedAt: new Date().toISOString(), uploadedBy: String(userId) });
    return this.view.message(chatId, `Кружок ${player.firstName} ${player.lastName} сохранён.`, [[{ text: "Посмотреть кружок", callback_data: `admin:video_player:${player.id}` }], [{ text: "Записанные кружки", callback_data: "admin:video_list:0" }]]);
  }
}
