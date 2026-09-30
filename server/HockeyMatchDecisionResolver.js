export class HockeyMatchDecisionResolver {
  resolveFromProtocolText(protocolText) {
    const text = String(protocolText || "");
    if (/решающ\w*\s+буллит|сер(?:ия|ии)\s+буллит/iu.test(text)) return "shootout";
    if (/овертайм/iu.test(text)) return "overtime";
    return null;
  }

  resolveFromScoreText(scoreText) {
    const text = String(scoreText || "").replace(/\s+/g, " ").trim();
    if (/(?:ПБ|Б)\s*$/iu.test(text)) return "shootout";
    if (/ОТ\s*$/iu.test(text)) return "overtime";
    return null;
  }
}
