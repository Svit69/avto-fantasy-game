import { HtmlTextCleaner } from "./HtmlTextCleaner.js";

export class VhlReportScoreParser {
  constructor(cleaner = new HtmlTextCleaner()) {
    this.cleaner = cleaner;
  }

  parseScore(html) {
    const scoreHtml = html.match(/match-card__score"[\s\S]*?<strong>([\s\S]*?)<\/strong>/)?.[1] || "";
    return this.#createScore(this.cleaner.stripTags(scoreHtml).match(/(\d+)\s*:\s*(\d+)/));
  }

  #createScore(match) {
    return match ? { homeGoals: Number(match[1]), awayGoals: Number(match[2]) } : null;
  }
}
