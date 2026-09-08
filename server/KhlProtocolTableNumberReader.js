export class KhlProtocolTableNumberReader {
  constructor(columnMap) { this.columnMap = columnMap; }

  readColumnNumber(items, columnName) {
    return this.readNumber(items, ...this.columnMap.getRange(columnName));
  }

  readNumber(items, minX, maxX) {
    return Number(this.readText(items, minX, maxX).match(/-?\d+/)?.[0] || 0);
  }

  readText(items, minX, maxX) {
    return items.filter((item) => item.x >= minX && item.x <= maxX).map((item) => item.text).join(" ").trim();
  }
}
