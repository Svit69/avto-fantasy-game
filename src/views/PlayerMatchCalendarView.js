import { MatchDateTimeFormatter } from "../services/MatchDateTimeFormatter.js";
import { PlayerCalendarMatchSelector } from "../services/PlayerCalendarMatchSelector.js";
import { PlayerMatchTeamResolver } from "../services/PlayerMatchTeamResolver.js";
import { AssetImageView } from "./AssetImageView.js";
import { PlayerMatchResultDetailView } from "./PlayerMatchResultDetailView.js";

export class PlayerMatchCalendarView {
  constructor(dateTimeFormatter = new MatchDateTimeFormatter(), imageView = new AssetImageView(), resultView = new PlayerMatchResultDetailView(), matchSelector = new PlayerCalendarMatchSelector(), teamResolver = new PlayerMatchTeamResolver()) {
    Object.assign(this, { dateTimeFormatter, imageView, resultView, matchSelector, teamResolver });
  }

  render(player, calendar, selectedMonth) {
    const matches = this.matchSelector.selectPlayerMonthMatches(player, calendar, selectedMonth);
    if (!matches.length) return this.#renderEmptyCalendar(selectedMonth);
    return `<article class="profile-panel profile-calendar-panel"><h3>Календарь</h3>${this.#renderMatchTiles(player, calendar, matches)}${this.#renderMatchDetails(player, matches[0])}<a href="#">Узнать как считаются очки</a></article>`;
  }

  #renderMatchTiles(player, calendar, matches) {
    return `<div class="profile-match-strip">${matches.map((match, index) => this.#renderMatchTile(player, calendar, match, index)).join("")}</div>`;
  }

  #renderMatchTile(player, calendar, match, index) {
    const opponent = this.#getOpponentForPlayer(player, match); const details = this.#getTeamDetails(match, opponent);
    const selected = index === 0 ? " is-selected" : ""; const venue = this.teamResolver.isPlayerHomeTeam(player, match) ? "Д" : "Г";
    return `<button class="profile-match-tile${selected}" data-profile-match-index="${index}" type="button"><span>${this.#findTourTitle(calendar, match.tourId)}</span>${this.#renderTileScore(match)}${this.#renderLogo(details.logoPath, opponent)}<strong>${details.shortName} (${venue})</strong></button>`;
  }

  #renderMatchDetails(player, match) {
    const home = this.#getTeamDetails(match, match.homeTeam, player); const away = this.#getTeamDetails(match, match.awayTeam, player);
    return `<div class="profile-match-details" data-profile-match-details>${this.renderMatchDetails(player, match, home, away)}</div>`;
  }

  renderMatchDetails(player, match) {
    const home = this.#getTeamDetails(match, match.homeTeam, player); const away = this.#getTeamDetails(match, match.awayTeam, player);
    const result = this.resultView.render(player, match, home.logoPath, away.logoPath);
    if (result) return result;
    return `<span>${match.homeTeam}</span>${this.#renderLogo(home.logoPath, match.homeTeam)}<time><b>${this.dateTimeFormatter.formatMatchDate(match.startsAt)}</b><b>${this.dateTimeFormatter.formatMatchTime(match.startsAt)}</b></time>${this.#renderLogo(away.logoPath, match.awayTeam)}<span>${match.awayTeam}</span>`;
  }

  #renderTileScore(match) { return match.playerMatchStats ? `<em>${match.playerMatchStats.fantasyPoints} ФО</em>` : ""; }
  #getOpponentForPlayer(player, match) { return this.teamResolver.resolveOpponentTeam(player, match); }
  #findTourTitle(calendar, tourId) { return calendar.tours.find((tour) => tour.id === tourId)?.title ?? "Тур"; }
  #getTeamDetails(match, teamName, player) { return match.homeTeam === teamName ? match.homeTeamDetails || this.#getPlayerTeamDetails(player, teamName) : match.awayTeamDetails || this.#getPlayerTeamDetails(player, teamName); }
  #getPlayerTeamDetails(player, teamName) { return { shortName: teamName, logoPath: this.#resolveTeamLogo(player, teamName) }; }
  #resolveTeamLogo(player, teamName) { return teamName === "Горняк-УГМК" ? "/assets/gornyak_logo.png" : player?.getTeam?.() === teamName ? player.getTeamLogo() : "/assets/avto_logo.png"; }
  #renderLogo(src, alt) { return this.imageView.renderAsset({ src, alt, fallback: "/assets/avto_logo.png" }); }
  #renderEmptyCalendar(month) { return `<article class="profile-panel"><h3>Календарь</h3><p>Матчи на ${month} пока не добавлены.</p><a href="#">Узнать как считаются очки</a></article>`; }
}
