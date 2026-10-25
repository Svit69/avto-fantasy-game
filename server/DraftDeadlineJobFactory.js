export class DraftDeadlineJobFactory {
  constructor(messageFactory) { this.messageFactory = messageFactory; }
  createJob(user, tour, hours, confirmed) {
    const type = confirmed ? "confirmed" : "missing";
    let text = confirmed ? this.messageFactory.createConfirmedRosterDeadlineMessage(tour)
      : this.messageFactory.createMissingRosterDeadlineMessage(tour, hours);
    const job = { userId: user.id, key: `deadline:${tour.id}:${hours}:${type}`, text };
    if (!confirmed) {
      job.text += "\n\nНет времени выбирать? Нажмите «Автозаполнение состава»: бот подберёт и сохранит полный состав в пределах 90к. Ранее выбранные игроки несохранённой заявки будут заменены. До дедлайна состав можно отредактировать в приложении.";
      const url = new URL(process.env.TELEGRAM_WEB_APP_URL || "http://localhost:3000"); url.searchParams.set("roster_month", tour.month);
      const data = `roster_auto:${tour.id}`;
      job.replyMarkup = { inline_keyboard: [[{ text: "Автозаполнение состава", callback_data: Buffer.byteLength(data) <= 64 ? data : "roster_auto:invalid" }],
        [{ text: "Собрать самостоятельно", web_app: { url: url.toString() } }]] };
    }
    return job;
  }
}
