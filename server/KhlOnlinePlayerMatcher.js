import { OnlineHockeyPlayerNameMatcher } from "./OnlineHockeyPlayerNameMatcher.js";

export class KhlOnlinePlayerMatcher {
  constructor(players) { this.players = players; this.names = new OnlineHockeyPlayerNameMatcher(); }
  findPlayer(row) {
    const ids = this.players.filter((player) => [player.khlPlayerId, player.khl_player_id, player.mhlPlayerId, player.mhl_player_id, player.id]
      .filter(Boolean).some((id) => String(id) === String(row.khlPlayerId)));
    if (ids.length === 1) return ids[0];
    if (ids.length > 1) return null;
    const names = this.players.filter((player) => this.names.isSamePlayer(player, row.name));
    return names.length === 1 ? names[0] : null;
  }
}
