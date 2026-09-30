import { HtmlTextCleaner } from "./HtmlTextCleaner.js";
import { HockeyMatchDecisionResolver } from "./HockeyMatchDecisionResolver.js";

export class VhlOnlineScoreParser {
  constructor(cleaner = new HtmlTextCleaner(), decisionResolver = new HockeyMatchDecisionResolver()) {
    Object.assign(this, { cleaner, decisionResolver });
  }

  parseScore(html) {
    return this.#parseScoreboard(html) || this.#parseDetailedScore(html) || this.#parseCalendarScore(html);
  }

  #parseScoreboard(html) {
    const scoreHtml = html.match(/game__score"[\s\S]*?>([\s\S]*?)<\/div>/)?.[1] || "";
    const scoreText = this.cleaner.stripTags(scoreHtml);
    return this.#createScore(scoreText.match(/(\d+)\s*:\s*(\d+)/), scoreText);
  }

  #parseDetailedScore(html) {
    const text = this.cleaner.stripTags(html.match(/Статистика матча:\s*<\/strong>([\s\S]*?)<\/p>/)?.[1] || "");
    return this.#createScore(text.match(/Голы:\s*(\d+)\s*-\s*(\d+)/));
  }

  #parseCalendarScore(html) {
    const text = this.cleaner.stripTags(html);
    return this.#createScore(text.match(/(\d+)\s*:\s*(\d+)/));
  }

  #createScore(match, scoreText = "") {
    return match ? { homeGoals: Number(match[1]), awayGoals: Number(match[2]), decidedBy: this.decisionResolver.resolveFromScoreText(scoreText) } : null;
  }
}
