export class KhlProtocolPdfDateParser {
  createScheduledAt(dateLine, time) {
    const date = this.#parseRussianDate(dateLine);
    return date && time ? `${date}T${time}:00+05:00` : null;
  }

  #parseRussianDate(line) {
    const months = { января: "01", февраля: "02", марта: "03", апреля: "04", мая: "05", июня: "06",
      июля: "07", августа: "08", сентября: "09", октября: "10", ноября: "11", декабря: "12" };
    const match = line.match(/(\d{1,2}) ([а-яё]+) (\d{4})/iu);
    return match ? `${match[3]}-${months[match[2].toLowerCase()]}-${match[1].padStart(2, "0")}` : null;
  }
}
