export class KhlProtocolScoreItemReader {
  readScore(pages) {
    for (const page of pages || []) {
      const startItem = page.find((item) => item.text.includes("Начало матча:"));
      if (!startItem) continue;
      const scoreItems = page.filter((item) => /^\d+$/.test(item.text) && Math.abs(item.y - startItem.y) <= 6);
      const homeItem = scoreItems.filter((item) => item.x < startItem.x).sort((a, b) => b.x - a.x)[0];
      const awayItem = scoreItems.filter((item) => item.x > startItem.x).sort((a, b) => a.x - b.x)[0];
      if (homeItem && awayItem) return [Number(homeItem.text), Number(awayItem.text)];
    }
    return null;
  }
}
