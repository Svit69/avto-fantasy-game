import { HtmlTextCleaner } from "./HtmlTextCleaner.js";

export class VhlOnlineScoreParser {
  constructor(cleaner = new HtmlTextCleaner()) {
    this.cleaner = cleaner;
  }

  parseScore(html) {
    return this.#parseDetailedScore(html) || this.#parseCalendarScore(html);
  }

  #parseDetailedScore(html) {
    const text = this.cleaner.stripTags(html.match(/Статистика матча:\s*<\/strong>([\s\S]*?)<\/p>/)?.[1] || "");
    return this.#createScore(text.match(/Голы:\s*(\d+)\s*-\s*(\d+)/));
  }

  #parseCalendarScore(html) {
    const text = this.cleaner.stripTags(html);
    return this.#createScore(text.match(/ГОР\s*(\d+)\s*:\s*(\d+)\s*ЧЕЛ/));
  }

  #createScore(match) {
    return match ? { homeGoals: Number(match[1]), awayGoals: Number(match[2]) } : null;
  }
}
