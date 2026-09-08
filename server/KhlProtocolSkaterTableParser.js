import { KhlProtocolSkaterColumnMap } from "./KhlProtocolSkaterColumnMap.js";
import { KhlProtocolTableNumberReader } from "./KhlProtocolTableNumberReader.js";
import { KhlProtocolRowGroupFactory } from "./KhlProtocolRowGroupFactory.js";

export class KhlProtocolSkaterTableParser {
  constructor(columnMap = new KhlProtocolSkaterColumnMap(), groupFactory = new KhlProtocolRowGroupFactory()) {
    Object.assign(this, { groupFactory, numberReader: new KhlProtocolTableNumberReader(columnMap) });
  }

  parseSkaterRows(content, teamName) {
    return content.pages.flatMap((page) => this.#parsePageRows(page, teamName));
  }

  #parsePageRows(page, teamName) {
    const label = page.find((item) => {
      return item.text === teamName && item.x < 130 && page.some((header) => header.y === item.y && header.text === "Ш");
    });
    if (!label) return [];
    const groupedRows = this.groupFactory.groupItemsByY(page.filter((item) => item.y < label.y && item.y > label.y - 210));
    return [...groupedRows.values()].map((items) => this.#parseRow(items, teamName)).filter(Boolean);
  }

  #parseRow(items, teamName) {
    const [numberItem, positionItem, ...nameItems] = items.filter((item) => item.x < 150).sort((a, b) => a.x - b.x);
    const number = numberItem?.text || "";
    const position = positionItem?.text || "";
    const name = nameItems.map((item) => item.text).join(" ").trim();
    if (!number || !["н", "з"].includes(position) || !name) return null;
    return { team: teamName, number, name, position, ...this.#readStats(items) };
  }

  #readStats(items) {
    const goals = this.numberReader.readColumnNumber(items, "goals");
    return {
      goals,
      assists: this.numberReader.readColumnNumber(items, "assists"),
      penalties: this.numberReader.readColumnNumber(items, "penalties"),
      shotsOnGoal: Math.max(this.numberReader.readColumnNumber(items, "shotsOnGoal") - goals, 0),
      blockedShots: this.numberReader.readColumnNumber(items, "blockedShots"),
      hits: this.numberReader.readColumnNumber(items, "hits"),
      takeaways: this.numberReader.readColumnNumber(items, "takeaways"),
      interceptions: this.numberReader.readColumnNumber(items, "interceptions"),
    };
  }
}
