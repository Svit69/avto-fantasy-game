export class VhlOnlineCalendarMatchResolver {
  constructor(calendarRepository) {
    this.calendarRepository = calendarRepository;
  }

  async findMatchByOnlineGameId(onlineGameId) {
    if (!this.calendarRepository) return null;
    const calendar = await this.calendarRepository.listCalendar();
    return (calendar.matches || []).find((match) => {
      return String(match.onlineProtocolId || match.gameId || "") === String(onlineGameId);
    }) || null;
  }

  createProviderIdentity(calendarMatch, onlineGameId) {
    if (!calendarMatch) return {};
    return {
      tournamentId: calendarMatch.tourId,
      gameId: String(onlineGameId),
      league: calendarMatch.league,
      scheduledAt: calendarMatch.startsAt,
    };
  }
}
