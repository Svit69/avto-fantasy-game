export class RosterChangeNotificationService {
  constructor({ userRepository, rosterRepository, dispatcher, messageFactory }) {
    Object.assign(this, { userRepository, rosterRepository, dispatcher, messageFactory });
  }

  async notifyPlayerTeamChanged(player, previousTeam, nextTeam) {
    if (!player || previousTeam === nextTeam) return 0;
    return this.#notifyAffectedUsers(player.id, `player-team:${player.id}:${previousTeam}:${nextTeam}`,
      this.messageFactory.createPlayerTeamChangedMessage(player, previousTeam, nextTeam));
  }

  async notifyPlayerLeftGame(player) {
    if (!player) return 0;
    return this.#notifyAffectedUsers(player.id, `player-left:${player.id}`, this.messageFactory.createPlayerLeftGameMessage(player));
  }

  async #notifyAffectedUsers(playerId, key, text) {
    const [users, rosters] = await Promise.all([this.userRepository.listUsers(), this.rosterRepository.listRosters()]);
    const activeUserIds = new Set(users.filter((user) => user.status !== "blocked").map((user) => user.id));
    const affectedUserIds = [...new Set(rosters.filter((roster) => this.#containsPlayer(roster, playerId)).map((roster) => roster.userId))];
    return this.dispatcher.dispatchNotificationJobs(affectedUserIds.filter((id) => activeUserIds.has(id)).map((userId) => ({ userId, key, text })));
  }

  #containsPlayer(roster, playerId) {
    return roster.slots?.some((slot) => slot.playerId === playerId);
  }
}
