export function createTourResultTestScenario() {
  const end = Date.parse("2026-10-31T18:00:00Z");
  const tour = { id: "october", title: "Октябрьский тур", month: "Октябрь", endsAt: new Date(end).toISOString() };
  const matches = ["a", "b"].map((id, index) => ({ id, tourId: tour.id, league: "КХЛ", homeTeam: "Автомобилист", awayTeam: "Трактор",
    khlGameId: id, startsAt: new Date(end - (index + 1) * 86400000).toISOString() }));
  const database = { matches: matches.map((match) => ({ ...match, gameId: match.id, scheduledAt: match.startsAt, status: "finished" })),
    playerStats: [10, 30, 40, 0, 10, 0, 999, 999].map((fantasyPoints, index) => ({ matchId: index % 2 ? "b" : "a", playerId: `p${Math.floor(index / 2) + 1}`, fantasyPoints })) };
  const players = [1, 2, 3, 4].map((id) => ({ id: `p${id}` }));
  const users = [1, 2, 3, 4].map((id) => ({ id: String(id), name: `Менеджер ${id}`, status: id === 4 ? "blocked" : "active",
    phone: `+7999000000${id}`, email: `user${id}@example.test`, username: `manager_${id}` }));
  const rosters = users.map((user) => ({ userId: user.id, month: tour.month, slots: [{ playerId: `p${user.id}` }] }));
  const repositories = { rosterRepository: { listRosters: async () => rosters }, playerCatalogRepository: { listPlayers: async () => players }, matchDataRepository: { readDatabase: async () => database } };
  return { end, tour, calendar: { tours: [tour], matches }, database, players, users, rosters, repositories };
}
