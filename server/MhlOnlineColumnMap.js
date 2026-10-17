export class MhlOnlineColumnMap {
  normalizeColumn(label) {
    const value = String(label).trim();
    return { Отб: "ОТБ", ОТБ: "ОТБ", отб: "ОТБ", "Бс": "БВ", "БС": "БВ", "Спр": "СПр", "№": "#" }[value] || value;
  }
}
