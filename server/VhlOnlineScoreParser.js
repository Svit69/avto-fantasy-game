import { HtmlTextCleaner } from "./HtmlTextCleaner.js";

export class VhlOnlineScoreParser {
  constructor(cleaner = new HtmlTextCleaner()) {
    this.cleaner = cleaner;
  }

  parseScore(html) {
    return this.#parseScoreboard(html) || this.#parseDetailedScore(html) || this.#parseCalendarScore(html);
  }

  #parseScoreboard(html) {
    const scoreHtml = html.match(/game__score"[\s\S]*?>([\s\S]*?)<\/div>/)?.[1] || "";
    return this.#createScore(this.cleaner.stripTags(scoreHtml).match(/(\d+)\s*:\s*(\d+)/));
  }

  #parseDetailedScore(html) {
    const text = this.cleaner.stripTags(html.match(/Статистика матча:\s*<\/strong>([\s\S]*?)<\/p>/)?.[1] || "");
    return this.#createScore(text.match(/Голы:\s*(\d+)\s*-\s*(\d+)/));
  }

  #parseCalendarScore(html) {
    const text = this.cleaner.stripTags(html);
    return this.#createScore(text.match(/(\d+)\s*:\s*(\d+)/));
  }

  #createScore(match) {
    return match ? { homeGoals: Number(match[1]), awayGoals: Number(match[2]) } : null;
  }
}
