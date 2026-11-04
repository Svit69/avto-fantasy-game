export class OnlineHockeyFailureMessageFactory {
  resolveNotificationStage(reason) { return /mhl_goalie_change_ambiguous|mhl_goalie_protocol|mhl_protocol_goalie/.test(reason) ? "error:goalie-protocol" : "error"; }
  createMessage(reason) {
    if (/mhl_goalie_change_ambiguous|mhl_goalie_protocol|mhl_protocol_goalie/.test(reason)) return `В трансляции не хватает данных для распределения статистики между вратарями. Официальный PDF пока не помог.\nЗагрузите протокол МХЛ через админку; он будет в приоритете.\nПричина: ${reason}\nПрежние данные сохранены. Повторим запрос позже.`;
    return `${reason}\nПрежние данные сохранены. Повторим запрос позже.`;
  }
}
