import { HtmlTextCleaner } from "./HtmlTextCleaner.js";

export class VhlOnlineTeamTabResolver {
  constructor(cleaner = new HtmlTextCleaner()) { this.cleaner = cleaner; }

  resolveTeamTab(html, teamName) {
    return ["stat-teamA", "stat-teamB"].find((tabName) => {
      const block = this.#extractTabBlock(html, tabName);
      return this.#readTeamName(block) === teamName;
    }) || "stat-teamB";
  }

  extractTeamBlock(html, teamName) {
    return this.#extractTabBlock(html, this.resolveTeamTab(html, teamName));
  }

  #extractTabBlock(html, tabName) {
    const start = this.#findContentTabStart(html, tabName);
    const next = html.indexOf('data-tab="stat-teams"', start + 1);
    return start >= 0 ? html.slice(start, next > start ? next : undefined) : "";
  }

  #readTeamName(block) {
    const match = block.match(/<div class="game-stats__team-name">([\s\S]*?)<\/div>/);
    return this.cleaner.stripTags(match?.[1] || "");
  }

  #findContentTabStart(html, tabName) {
    const pattern = new RegExp(`<div class="game__content_tabs__item[^"]*" data-tab="${tabName}"`);
    const match = html.match(pattern);
    return match ? match.index : -1;
  }
}
