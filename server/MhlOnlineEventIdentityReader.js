import { MhlTeamNameNormalizer } from "./MhlTeamNameNormalizer.js";

export class MhlOnlineEventIdentityReader {
  readSide(element, game) {
    const logo = element.find(".game-legend-item-logo").first();
    const id = logo.attr("src")?.match(/\/\d+\/(\d+)\/90\.png/)?.[1];
    if (id === String(game.info.data.teama)) return "A";
    if (id === String(game.info.data.teamb)) return "B";
    const name = new MhlTeamNameNormalizer().normalizeTeamName(logo.attr("title"));
    if (name === game.teams.home.name) return "A";
    if (name === game.teams.visitor.name) return "B";
    throw new Error("mhl_event_team_unknown");
  }
  readPlayerNumber(link, game, side) {
    const id = link.attr("href")?.match(/\/players\/(\d+)\//)?.[1];
    const player = Object.values(game.players[side]).find((candidate) => String(candidate.id) === id);
    if (!player) throw new Error("mhl_event_player_unknown");
    return player.jn;
  }
  readTime(element) {
    const value = element.find(".game-legend-item-info-time").text().trim().match(/^(\d+):([0-5]\d)$/);
    if (!value) throw new Error("mhl_event_time_invalid");
    return Number(value[1]) * 60 + Number(value[2]);
  }
}
