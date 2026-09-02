export class AdminPendingActionController {
  constructor({ stateStore, view, protocolView }) {
    Object.assign(this, { stateStore, view, protocolView });
  }

  renderMenuAndClearState(chatId) {
    this.stateStore.clearState(chatId);
    return this.view.renderMenu(chatId);
  }

  cancelPendingAction(chatId) {
    this.stateStore.clearState(chatId);
    return this.protocolView.renderCancelled(chatId);
  }
}
