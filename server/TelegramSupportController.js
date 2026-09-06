export class TelegramSupportController {
  constructor({ feedbackController, fallbackLinkController }) {
    Object.assign(this, { feedbackController, fallbackLinkController });
  }

  async createReply(update) {
    return (await this.feedbackController.createReply(update)) || this.fallbackLinkController.createReply(update);
  }
}
