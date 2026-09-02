export class KhlProtocolSkaterTableParser {
  parseSkaterRows(content, teamName) {
    return content.pages.flatMap((page) => this.#parsePageRows(page, teamName));
  }

  #parsePageRows(page, teamName) {
    const label = page.find((item) => {
      return item.text === teamName && item.x < 130 && page.some((header) => header.y === item.y && header.text === "Ш");
    });
    if (!label) return [];
    const groupedRows = this.#groupItemsByY(page.filter((item) => item.y < label.y && item.y > label.y - 210));
    return [...groupedRows.values()].map((items) => this.#parseRow(items, teamName)).filter(Boolean);
  }

  #parseRow(items, teamName) {
    const number = this.#readText(items, 38, 52);
    const position = this.#readText(items, 58, 68);
    const name = this.#readText(items, 70, 150);
    if (!number || !["н", "з"].includes(position) || !name) return null;
    return { team: teamName, number, name, position, ...this.#readStats(items) };
  }

  #readStats(items) {
    const goals = this.#readNumber(items, 156, 167);
    return {
      goals,
      assists: this.#readNumber(items, 169, 178),
      penalties: this.#readNumber(items, 206, 216),
      shotsOnGoal: Math.max(this.#readNumber(items, 410, 421) - goals, 0),
      hits: this.#readNumber(items, 456, 469),
      takeaways: this.#readNumber(items, 476, 487),
      interceptions: this.#readNumber(items, 493, 505),
    };
  }

  #readText(items, minX, maxX) {
    return items.filter((item) => item.x >= minX && item.x <= maxX).map((item) => item.text).join(" ").trim();
  }

  #readNumber(items, minX, maxX) {
    return Number(this.#readText(items, minX, maxX).match(/-?\d+/)?.[0] || 0);
  }

  #groupItemsByY(items) {
    return items.reduce((grouped, item) => {
      grouped.set(item.y, [...(grouped.get(item.y) || []), item]);
      return grouped;
    }, new Map());
  }
}
