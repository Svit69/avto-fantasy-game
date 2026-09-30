import { HtmlTextCleaner } from "./HtmlTextCleaner.js";
import { HockeyMatchDecisionResolver } from "./HockeyMatchDecisionResolver.js";

export class VhlReportScoreParser {
  constructor(cleaner = new HtmlTextCleaner(), decisionResolver = new HockeyMatchDecisionResolver()) {
    Object.assign(this, { cleaner, decisionResolver });
  }

  parseScore(html) {
    const scoreHtml = html.match(/match-card__score"[\s\S]*?>([\s\S]*?)<\/p>/)?.[1] || "";
    const scoreText = this.cleaner.stripTags(scoreHtml);
    return this.#createScore(scoreText.match(/(\d+)\s*:\s*(\d+)/), scoreText);
  }

  #createScore(match, scoreText) {
    return match ? { homeGoals: Number(match[1]), awayGoals: Number(match[2]), decidedBy: this.decisionResolver.resolveFromScoreText(scoreText) } : null;
  }
}
