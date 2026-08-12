export class PlayerAvailabilityService {
  static canSelectPlayer(player, roster) {
    return !roster.isPositionFull(player.getPosition()) && !roster.hasPlayer(player);
  }

  static isPlayerSelected(player, roster) {
    return roster.hasPlayer(player);
  }

  static getSelectionLabel(player, roster) {
    if (roster.hasPlayer(player)) {
      return `${player.getName()} уже в составе`;
    }

    return this.canSelectPlayer(player, roster)
      ? `Добавить ${player.getName()}`
      : `Позиция ${player.getPosition()} заполнена`;
  }
}
