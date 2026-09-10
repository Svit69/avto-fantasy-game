import { AdminConversationStateStore } from "./AdminConversationStateStore.js";
import { AdminKeyboardFactory } from "./AdminKeyboardFactory.js";
import { AdminPanelView } from "./AdminPanelView.js";
import { AdminPendingActionController } from "./AdminPendingActionController.js";
import { AdminProtocolPanelView } from "./AdminProtocolPanelView.js";
import { AdminRosterReportView } from "./AdminRosterReportView.js";

export class AdminViewContextFactory {
  createViewContext() {
    const stateStore = new AdminConversationStateStore();
    const keyboardFactory = new AdminKeyboardFactory();
    const view = new AdminPanelView(keyboardFactory);
    const protocolView = new AdminProtocolPanelView(keyboardFactory);
    return { stateStore, view, protocolView, rosterView: new AdminRosterReportView(),
      pendingActionController: new AdminPendingActionController({ stateStore, view, protocolView }) };
  }
}
