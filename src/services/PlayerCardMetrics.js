export class PlayerCardMetrics {
  static calculateFantasyScore(player) {
    return Math.max(1, Math.round(player.getPrice() * 2));
  }

  static getShortPositionName(player) {
    const positionMap = {
      ВРАТАРЬ: "ВРТ",
      ЗАЩИТНИКИ: "ЗАЩ",
      НАПАДАЮЩИЕ: "НАП",
    };

    return positionMap[player.getPosition()] ?? player.getPosition();
  }

  static getFullPositionName(player) {
    const positionMap = {
      ВРАТАРЬ: "ВРАТАРЬ",
      ЗАЩИТНИКИ: "ЗАЩИТНИК",
      НАПАДАЮЩИЕ: "НАПАДАЮЩИЙ",
    };

    return positionMap[player.getPosition()] ?? player.getPosition();
  }
}
