export class TourAvailabilityMessageFactory {
  createMessage(tour) {
    return `До начала тура «${tour.title}» осталась неделя.\n\nСостав на этот тур уже можно собрать. Переходите в приложение и выбирайте игроков.`;
  }

  createApplicationButton(appUrl) {
    return { inline_keyboard: [[{ text: "Перейти в приложение", web_app: { url: appUrl } }]] };
  }
}
