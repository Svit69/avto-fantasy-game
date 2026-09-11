export class KhlProtocolSkaterColumnMap {
  constructor(columns = null) {
    this.columns = Object.freeze(columns || {
      goals: [156, 167],
      assists: [168, 175],
      penalties: [206, 216],
      shotsOnGoal: [421, 432],
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
    const pageColumns = Object.fromEntries(Object.entries(this.#createHeaderNames()).map(([columnName, headerName]) => {
      return [columnName, this.#createRangeAroundHeader(headers, headerName) || this.getRange(columnName)];
    }));
    return new KhlProtocolSkaterColumnMap({ ...this.columns, ...pageColumns });
  }

  #readHeaderPositions(page, headerY) {
    return page.filter((item) => Math.abs(item.y - headerY) <= 1).sort((left, right) => left.x - right.x);
  }

  #createHeaderNames() {
    return { goals: "Ш", assists: "А" };
  }

  #createRangeAroundHeader(headers, headerName) {
    const index = headers.findIndex((item) => item.text === headerName);
    if (index < 0) return null;
    const previous = headers[index - 1]?.x ?? headers[index].x - 10;
    const next = headers[index + 1]?.x ?? headers[index].x + 10;
    return [Math.floor((previous + headers[index].x) / 2), Math.floor((headers[index].x + next) / 2)];
  }
}
