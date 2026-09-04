import { AdminRosterReportFormatter } from "./AdminRosterReportFormatter.js";

export class AdminRosterReportView {
  constructor(months = ["Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь", "Январь", "Февраль", "Март"], formatter = new AdminRosterReportFormatter()) {
    this.months = months;
    this.formatter = formatter;
  }

  renderMonthPrompt(chatId) {
    return this.#message(chatId, "Составы пользователей\nВыберите туровый месяц.", this.#createMonthKeyboard());
  }

  renderMonthlyRosters(chatId, { month, page = 0, rosters, users, players }) {
    const monthlyRosters = this.#getMonthlyRosters(rosters, month);
    const pageCount = Math.max(1, Math.ceil(monthlyRosters.length / 5));
    const currentPage = Math.min(Math.max(0, page), pageCount - 1);
    const text = this.formatter.formatReport({ month, rosters: this.#slicePage(monthlyRosters, currentPage),
      users, players, total: monthlyRosters.length, page: currentPage, pageCount });
    return this.#message(chatId, text, this.#createRosterKeyboard(month, currentPage, pageCount));
  }

  #getMonthlyRosters(rosters, month) {
    return rosters.filter((roster) => roster.month === month)
      .sort((firstRoster, secondRoster) => String(firstRoster.userId).localeCompare(String(secondRoster.userId)));
  }

  #slicePage(rosters, page) {
    return rosters.slice(page * 5, page * 5 + 5);
  }

  #createMonthKeyboard() {
    return this.months.map((month) => [{ text: month, callback_data: `admin:rosters:${month}` }])
      .concat([[{ text: "В меню", callback_data: "admin:menu" }]]);
  }

  #createRosterKeyboard(month, page, pageCount) {
    const navigation = [];
    if (page > 0) navigation.push({ text: "Назад", callback_data: `admin:rosters:${month}:${page - 1}` });
    if (page < pageCount - 1) navigation.push({ text: "Вперёд", callback_data: `admin:rosters:${month}:${page + 1}` });
    return (navigation.length ? [navigation] : []).concat(this.#createMonthKeyboard());
  }

  #message(chatId, text, inline_keyboard) {
    return { method: "sendMessage", chat_id: chatId, text, parse_mode: "HTML", reply_markup: { inline_keyboard } };
  }
}
