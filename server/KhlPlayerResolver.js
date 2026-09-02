export class KhlPlayerResolver {
  constructor(players) { this.players = players; }

  findPlayerByKhlId(khlPlayerId) {
    return this.players.find((player) => String(player.khl_player_id || player.khlPlayerId || "") === String(khlPlayerId)) || null;
  }
}
