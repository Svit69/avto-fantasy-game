import { KhlProtocolSkaterColumnMap } from "./KhlProtocolSkaterColumnMap.js";
import { KhlProtocolTableNumberReader } from "./KhlProtocolTableNumberReader.js";
import { KhlProtocolRowGroupFactory } from "./KhlProtocolRowGroupFactory.js";

export class KhlProtocolSkaterTableParser {
  constructor(columnMap = new KhlProtocolSkaterColumnMap(), groupFactory = new KhlProtocolRowGroupFactory()) {
    Object.assign(this, { columnMap, groupFactory });
  }

  parseSkaterRows(content, teamName) {
    return content.pages.flatMap((page) => this.#parsePageRows(page, teamName));
  }

  #parsePageRows(page, teamName) {
    const label = page.find((item) => {
      return item.text === teamName && item.x < 130 && page.some((header) => header.y === item.y && header.text === "Ш");
    });
    if (!label) return [];
    const numberReader = new KhlProtocolTableNumberReader(this.columnMap.createPageColumnMap(page, label.y));
    const groupedRows = this.groupFactory.groupItemsByY(page.filter((item) => item.y < label.y && item.y > label.y - 210));
    return [...groupedRows.values()].map((items) => this.#parseRow(items, teamName, numberReader)).filter(Boolean);
  }

  #parseRow(items, teamName, numberReader) {
    const [numberItem, positionItem, ...nameItems] = items.filter((item) => item.x < 150).sort((a, b) => a.x - b.x);
    const number = numberItem?.text || "";
    const position = positionItem?.text || "";
    const name = nameItems.map((item) => item.text).join(" ").trim();
    if (!number || !["н", "з"].includes(position) || !name) return null;
    return { team: teamName, number, name, position, appearances: this.#hasIceTime(items) ? 1 : 0,
      ...this.#readStats(items, numberReader) };
  }

  #readStats(items, numberReader) {
    const goals = numberReader.readColumnNumber(items, "goals");
    return {
      goals,
      assists: numberReader.readColumnNumber(items, "assists"),
      penalties: Math.ceil(numberReader.readColumnNumber(items, "penalties") / 2),
      shotsOnGoal: numberReader.readColumnNumber(items, "shotsOnGoal"),
      blockedShots: numberReader.readColumnNumber(items, "blockedShots"),
      hits: numberReader.readColumnNumber(items, "hits"),
      takeaways: numberReader.readColumnNumber(items, "takeaways"),
      interceptions: numberReader.readColumnNumber(items, "interceptions"),
    };
  }
  #hasIceTime(items) {
    return items.some((item) => /(?:[1-9]\d*):\d{2}/.test(item.text));
  }
}
