import { PlayerPriceReviewService } from "./PlayerPriceReviewService.js";
import { AdminPriceReviewView } from "./AdminPriceReviewView.js";

export class AdminPriceReviewController {
  constructor({ stateStore, service, view = new AdminPriceReviewView(), ...repositories }) {
    Object.assign(this, { stateStore, view, service: service || new PlayerPriceReviewService(repositories) });
  }
  async executeRoute(source) {
    this.stateStore.clearState(source.chatId);
    if (source.route.type === "price_review_help") return this.view.renderExplanation(source.chatId);
    return this.view.renderReport(source.chatId, await this.service.createReviewReport(), source.route.page);
  }
}
