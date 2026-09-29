export class KhlProtocolSkaterColumnMap {
  constructor(columns = null) {
    this.columns = Object.freeze(columns || {
      goals: [156, 167],
      assists: [168, 175],
      penalties: [211, 228],
      shotsOnGoal: [406, 420],
      blockedShots: [445, 456],
      hits: [456, 469],
      takeaways: [476, 487],
      interceptions: [493, 505],
    });
  }

  getRange(columnName) {
    return this.columns[columnName] || [0, 0];
  }

  createPageColumnMap(page, headerY) {
    const headers = this.#readHeaderPositions(page, headerY);
    const pageColumns = Object.fromEntries(Object.entries(this.#createHeaderNames()).map(([columnName, headerNames]) => {
      return [columnName, this.#createRangeAroundHeader(headers, headerNames) || this.getRange(columnName)];
    }));
    return new KhlProtocolSkaterColumnMap({ ...this.columns, ...pageColumns });
  }

  #readHeaderPositions(page, headerY) {
    return page.filter((item) => Math.abs(item.y - headerY) <= 1).sort((left, right) => left.x - right.x);
  }

  #createHeaderNames() {
    return { goals: ["Ш"], assists: ["А"], penalties: ["Штр"], shotsOnGoal: ["Бс"],
      blockedShots: ["БлБ"], hits: ["СПр"], takeaways: ["Отб", "ОТБ"], interceptions: ["ПХТ"] };
  }

  #createRangeAroundHeader(headers, headerNames) {
    const index = headers.findIndex((item) => headerNames.includes(item.text));
    if (index < 0) return null;
    const previous = headers[index - 1]?.x ?? headers[index].x - 10;
    const next = headers[index + 1]?.x ?? headers[index].x + 10;
    const center = headers[index].x;
    return [Math.max(Math.floor((previous + center) / 2), center - 9),
      Math.min(Math.floor((center + next) / 2), center + 9)];
  }
}
