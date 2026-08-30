export class TelegramAdminPanelController {
  constructor({ accessPolicy, commandParser, view, userRepository, playerCatalogRepository, botClient, logger }) {
    Object.assign(this, { accessPolicy, commandParser, view, userRepository, playerCatalogRepository, botClient, logger });
  }

  async createReply(update) {
    const source = this.#extractAdminSource(update);
    if (!source) return null;
    if (!this.accessPolicy.canManageBot(source.userId)) return this.view.renderAccessDenied(source.chatId);
    if (source.callbackId) this.#answerCallback(source.callbackId);
    return this.#executeAdminAction(source);
  }

  #extractAdminSource(update) {
    if (update.callback_query?.data?.startsWith("admin:")) return this.#fromCallback(update.callback_query);
    const command = this.commandParser.parseAdminCommand(update.message?.text);
    return command ? { command, chatId: update.message.chat.id, userId: update.message.from?.id } : null;
  }

  #fromCallback(callback) {
    const type = callback.data.replace("admin:", "");
    return { command: { type }, chatId: callback.message.chat.id, userId: callback.from?.id, callbackId: callback.id };
  }

  async #executeAdminAction(source) {
    if (source.command.type === "admin") return this.view.renderMenu(source.chatId);
    if (source.command.type === "users") return this.view.renderUsers(source.chatId, await this.userRepository.listUsers());
    if (source.command.type === "players") return this.view.renderPlayers(source.chatId, await this.playerCatalogRepository.listPlayers());
    return this.#updatePlayer(source);
  }

  async #updatePlayer(source) {
    const { type, playerId, price, team } = source.command;
    if (!playerId || (type === "set_price" && !Number.isFinite(price))) return this.view.renderInvalidCommand(source.chatId);
    if (type === "set_team" && !team) return this.view.renderInvalidCommand(source.chatId);
    if (type === "set_price") return this.view.renderOperationResult(source.chatId, await this.playerCatalogRepository.updatePlayerPrice(playerId, price), "Цена обновлена");
    return this.view.renderOperationResult(source.chatId, await this.playerCatalogRepository.updatePlayerTeam(playerId, team), "Команда обновлена");
  }

  #answerCallback(callbackId) {
    this.botClient.callMethod("answerCallbackQuery", { callback_query_id: callbackId }).catch((error) => {
      this.logger.warn("telegram_admin_callback_failed", { errorMessage: error.message });
    });
  }
}
