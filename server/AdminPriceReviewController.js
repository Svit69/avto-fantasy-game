import { PlayerPriceReviewService } from "./PlayerPriceReviewService.js";
import { AdminPriceReviewView } from "./AdminPriceReviewView.js";
import { AdminPriceReviewPlayerView } from "./AdminPriceReviewPlayerView.js";
import { CachedPriceReviewService } from "./CachedPriceReviewService.js";

export class AdminPriceReviewController {
  constructor({ stateStore, service, view = new AdminPriceReviewView(), ...repositories }) {
    Object.assign(this, { stateStore, view, service: service || new CachedPriceReviewService(new PlayerPriceReviewService(repositories)) });
  }
  async executeRoute(source) {
    this.stateStore.clearState(source.chatId);
    if (source.route.type === "price_review_help") return this.view.renderExplanation(source.chatId);
    const report = await this.service.createReviewReport(source.route.type === "price_review_refresh");
    if (source.route.type === "price_review_players") return new AdminPriceReviewPlayerView().renderPlayers(source.chatId, report, source.route.page);
    return this.view.renderReport(source.chatId, report, source.route.page);
  }
}
