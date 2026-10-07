import { AdminMatchScoreFormatter } from "./AdminMatchScoreFormatter.js";

export class VhlOnlineAdminNotificationTextFactory {
  constructor(scoreFormatter = new AdminMatchScoreFormatter()) { this.scoreFormatter = scoreFormatter; }
  createMatchStartedText(match) {
    return `ВХЛ онлайн: матч начался\n${this.#createMatchLine(match)}\nid: ${match.onlineGameId}`;
  }

  createInterimResultText(match, result) {
    return `ВХЛ онлайн: промежуточный сбор выполнен\n${this.#createMatchLine(match)}\nСобытий: ${result.eventsReceived}\nФО-записей: ${result.pointEntriesCreated}`;
  }

  createFinalCollectionText(match, result) {
    return `ВХЛ онлайн: финальный сбор выполнен\n${this.#createMatchLine(match)}\nИгроков со статистикой: ${result.playerStats.length}`;
  }

  createProtocolMismatchText(match, sourceMatch) {
    return `ВХЛ: ID ${match.onlineGameId} не совпадает с календарем\nОжидалось: ${match.homeTeam} - ${match.awayTeam}, ${match.startsAt?.slice(0, 10)}\nНа странице: ${sourceMatch.homeTeam || "?"} - ${sourceMatch.awayTeam || "?"}, ${sourceMatch.scheduledAt?.slice(0, 10) || "?"}\nДанные не загружены. Проверьте ID в админ-боте.`;
  }

  createProtocolUnavailableText(match) {
    return `ВХЛ: страница ID ${match.onlineGameId} не открылась\n${match.homeTeam} - ${match.awayTeam}, ${match.startsAt?.slice(0, 10)}\nДанные не загружены. Опрос продолжится; проверьте ID в админ-боте.`;
  }

  #createMatchLine(match) {
    const score = match.score ? ` ${this.scoreFormatter.formatInline(match.score)}` : "";
    return `${match.homeTeam} - ${match.awayTeam}${score}`;
  }
}
