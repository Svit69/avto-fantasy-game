export class PlayerPriceReviewTestFixtures {
  createScenario() {
    const tours = [8, 9, 10, 11].map((month) => ({ id: month === 8 ? "2026-08-predseason" : `tour-${month}`,
      title: `Тур ${month}`, startsAt: `2026-${month.toString().padStart(2, "0")}-01T00:00:00Z`, status: "upcoming" }));
    const matches = [9, 10].flatMap((month) => Array.from({ length: 5 }, (_, index) => ({ id: `calendar-${month}-${index}`,
      tourId: `tour-${month}`, startsAt: `2026-${month.toString().padStart(2, "0")}-0${index + 1}T10:00:00Z`,
      homeTeam: "Автомобилист", awayTeam: `Соперник ${index}`, league: "КХЛ", gameId: `${month}-${index}` })));
    const players = [40, 5, 20, 20, 20].map((points, index) => ({ id: `player-${index}`, firstName: "Михаил", lastName: `Игрок ${index}`,
      team: "Автомобилист", position: "нападающий", price: 10, testPoints: points }));
    const imported = matches.map((match) => ({ id: `import-${match.id}`, gameId: match.gameId, scheduledAt: match.startsAt,
      homeTeam: match.homeTeam, awayTeam: match.awayTeam, league: match.league, status: "finished", updatedAt: "2026-10-10T00:00:00Z" }));
    const playerStats = imported.flatMap((match) => players.map((player) => ({ matchId: match.id, playerId: player.id, fantasyPoints: player.testPoints })));
    return { calendar: { tours, matches }, players, database: { matches: imported, playerStats }, now: new Date("2026-10-11T00:00:00Z") };
  }
  createRepositories(scenario) {
    return { playerCatalogRepository: { listPlayers: async () => scenario.players }, calendarRepository: { listCalendar: async () => scenario.calendar },
      matchDataRepository: { readDatabase: async () => scenario.database }, clock: () => scenario.now };
  }
}
