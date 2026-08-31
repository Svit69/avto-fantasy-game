import { MatchDateTimeFormatter } from "../services/MatchDateTimeFormatter.js";
import { versionAssetUrl } from "../utils/AssetUrlVersioner.js";

export class PlayerMatchCalendarView {
  constructor(dateTimeFormatter = new MatchDateTimeFormatter()) {
    this.dateTimeFormatter = dateTimeFormatter;
  }

  render(player, calendar, selectedMonth) {
    const matches = this.#findPlayerMonthMatches(player, calendar, selectedMonth);
    if (!matches.length) return this.#renderEmptyCalendar(selectedMonth);
    return `<article class="profile-panel profile-calendar-panel"><h3>Календарь</h3>${this.#renderMatchTiles(player, calendar, matches)}${this.#renderMatchDetails(player, matches[0])}<a href="#">Узнать как считаются очки</a></article>`;
  }

  #findPlayerMonthMatches(player, calendar, selectedMonth) {
    const tourIds = new Set(calendar.tours.filter((tour) => tour.month === selectedMonth).map((tour) => tour.id));
    return calendar.matches.filter((match) => tourIds.has(match.tourId) && [match.homeTeam, match.awayTeam].includes(player.getTeam()));
  }

  #renderMatchTiles(player, calendar, matches) {
    return `<div class="profile-match-strip">${matches.map((match, index) => this.#renderMatchTile(player, calendar, match, index)).join("")}</div>`;
  }

  #renderMatchTile(player, calendar, match, index) {
    const opponent = this.#getOpponentForPlayer(player, match); const details = this.#getTeamDetails(match, opponent);
    const selected = index === 0 ? " is-selected" : ""; const venue = match.homeTeam === player.getTeam() ? "Д" : "Г";
    return `<button class="profile-match-tile${selected}" data-profile-match-index="${index}" type="button"><span>${this.#findTourTitle(calendar, match.tourId)}</span><img src="${versionAssetUrl(details.logoPath)}" alt="${opponent}" /><strong>${details.shortName} (${venue})</strong></button>`;
  }

  #renderMatchDetails(player, match) {
    const home = this.#getTeamDetails(match, match.homeTeam, player); const away = this.#getTeamDetails(match, match.awayTeam, player);
    return `<div class="profile-match-details" data-profile-match-details>${this.renderMatchDetails(player, match, home, away)}</div>`;
  }

  renderMatchDetails(player, match) {
    const home = this.#getTeamDetails(match, match.homeTeam, player); const away = this.#getTeamDetails(match, match.awayTeam, player);
    return `<span>${match.homeTeam}</span><img src="${versionAssetUrl(home.logoPath)}" alt="${match.homeTeam}" /><time><b>${this.dateTimeFormatter.formatMatchDate(match.startsAt)}</b><b>${this.dateTimeFormatter.formatMatchTime(match.startsAt)}</b></time><img src="${versionAssetUrl(away.logoPath)}" alt="${match.awayTeam}" /><span>${match.awayTeam}</span>`;
  }

  #getOpponentForPlayer(player, match) { return match.homeTeam === player.getTeam() ? match.awayTeam : match.homeTeam; }
  #findTourTitle(calendar, tourId) { return calendar.tours.find((tour) => tour.id === tourId)?.title ?? "Тур"; }
  #getTeamDetails(match, teamName, player) { return match.homeTeam === teamName ? match.homeTeamDetails || this.#getPlayerTeamDetails(player, teamName) : match.awayTeamDetails || this.#getPlayerTeamDetails(player, teamName); }
  #getPlayerTeamDetails(player, teamName) { return { shortName: teamName, logoPath: player?.getTeamLogo?.() || "/assets/avto_logo.png" }; }
  #renderEmptyCalendar(month) { return `<article class="profile-panel"><h3>Календарь</h3><p>Матчи на ${month} пока не добавлены.</p><a href="#">Узнать как считаются очки</a></article>`; }
}
