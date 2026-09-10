export class VhlOnlineAdminNotificationTextFactory {
  createMatchStartedText(match) {
    return `ВХЛ онлайн: матч начался\n${this.#createMatchLine(match)}\nid: ${match.onlineGameId}`;
  }

  createInterimResultText(match, result) {
    return `ВХЛ онлайн: промежуточный сбор выполнен\n${this.#createMatchLine(match)}\nСобытий: ${result.eventsReceived}\nФО-записей: ${result.pointEntriesCreated}`;
  }

  createFinalCollectionText(match, result) {
    return `ВХЛ онлайн: финальный сбор выполнен\n${this.#createMatchLine(match)}\nИгроков со статистикой: ${result.playerStats.length}`;
  }

  #createMatchLine(match) {
    const score = match.score ? ` ${match.score.homeGoals}:${match.score.awayGoals}` : "";
    return `${match.homeTeam} - ${match.awayTeam}${score}`;
  }
}
