export class KhlProtocolGoalieTableParser {
  parseGoalieRows(content, teamName) {
    return content.pages.flatMap((page) => this.#parsePageRows(page, teamName));
  }

  #parsePageRows(page, teamName) {
    const label = page.find((item) => {
      return item.text === teamName && item.x > 90 && item.x < 130 && page.some((header) => {
        return header.text === "Время на площадке" && header.y > item.y && header.y < item.y + 20;
      });
    });
    if (!label) return [];
    const rows = this.#groupItemsByY(page.filter((item) => item.y < label.y && item.y > label.y - 60));
    return [...rows.values()].map((items) => this.#parseRow(items, teamName)).filter(Boolean);
  }

  #parseRow(items, teamName) {
    const [numberItem, positionItem, ...nameItems] = items.filter((item) => item.x < 180).sort((a, b) => a.x - b.x);
    const number = numberItem?.text || "";
    const position = positionItem?.text || "";
    const name = nameItems.map((item) => item.text).join(" ").trim();
    const total = [...items].reverse().find((item) => /\d+\s*-\s*\d+/.test(item.text))?.text.match(/(\d+)\s*-\s*(\d+)/);
    if (!number || position !== "вр" || !name || !total) return null;
    const goalsAgainst = Number(total[1]);
    return { team: teamName, number, name, position, goalsAgainst, saves: Math.max(Number(total[2]) - goalsAgainst, 0) };
  }

  #readText(items, minX, maxX) {
    return items.filter((item) => item.x >= minX && item.x <= maxX).map((item) => item.text).join(" ").trim();
  }

  #groupItemsByY(items) {
    return items.reduce((grouped, item) => {
      grouped.set(item.y, [...(grouped.get(item.y) || []), item]);
      return grouped;
    }, new Map());
  }
}
