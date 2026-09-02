export class KhlPlayerResolver {
  constructor(players) { this.players = players; }

  findPlayerByKhlId(khlPlayerId) {
    return this.players.find((player) => {
      return [player.khl_player_id, player.khlPlayerId, player.id].map(String).includes(String(khlPlayerId));
    }) || null;
  }
}
