export class MatchDateTimeFormatter {
  constructor(locale = "ru-RU") {
    this.locale = locale;
    this.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  formatMatchDateTime(isoDateTime) {
    return new Intl.DateTimeFormat(this.locale, {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: this.timeZone,
    }).format(new Date(isoDateTime));
  }
}
