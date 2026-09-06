export class TelegramMiniAppReplyService {
  constructor({ appUrl, appUrlFactory, replyFactory }) {
    Object.assign(this, { appUrl, appUrlFactory, replyFactory });
  }

  createMiniAppMessage(chatId, user) {
    const url = this.appUrlFactory.createAuthorizedAppUrl(this.appUrl, user);
    return this.replyFactory.createMiniAppMessage(chatId, url);
  }
}
