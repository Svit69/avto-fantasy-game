export class DraftNotificationMessageFactory {
  createMissingRosterDeadlineMessage(tour, hoursLeft) {
    return `До дедлайна тура «${tour.title}» осталось ${hoursLeft} ${this.#formatHourWord(hoursLeft)}.\n\nПохоже, ваш состав еще не сохранен. Зайдите в мини-приложение и спокойно закройте пустые слоты, пока рынок открыт.`;
  }

  createConfirmedRosterDeadlineMessage(tour) {
    return `До дедлайна тура «${tour.title}» остался 1 час.\n\nВаш состав сохранен. Если хотите, еще можно проверить календарь и точечно усилить линии до фиксации тура.`;
  }

  createTourOpenedMessage(currentTour, nextTour) {
    const nextText = nextTour ? `\n\nСледующий драфт уже открыт: «${nextTour.title}». Можно заранее присмотреть игроков и собрать свежую заявку.` : "";
    return `Игровой день тура «${currentTour.title}» начался.\n\nСоставы зафиксированы, дальше следим за матчами и очками хоккеистов.${nextText}`;
  }

  createPlayerTeamChangedMessage(player, previousTeam, nextTeam) {
    return `${player.firstName} ${player.lastName} сменил команду в нашей системе: «${previousTeam}» → «${nextTeam}».\n\nОн есть в вашем сохраненном составе. Учтите это перед дедлайном: от команды зависит расчет игровых множителей.`;
  }

  createPlayerLeftGameMessage(player) {
    return `${player.firstName} ${player.lastName} покинул нашу игру и больше не доступен для выбора.\n\nОн есть в вашем сохраненном составе. Если дедлайн еще не наступил, замените его, чтобы не оставлять проблемный слот.`;
  }

  #formatHourWord(hours) { return hours === 1 ? "час" : "часа"; }
}
