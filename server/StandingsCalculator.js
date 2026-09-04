export class StandingsCalculator {
  createMonthlyStandings(rosters, users, playerPoints, month, currentUserId) {
    const activeUsers = new Map(users.filter((user) => user.status !== "blocked").map((user) => [user.id, user]));
    const entries = rosters.filter((roster) => roster.month === month && activeUsers.has(roster.userId))
      .map((roster) => this.#createStandingEntry(roster, activeUsers.get(roster.userId), playerPoints));
    const rankedEntries = this.#assignPlaces(entries.sort(this.#compareStandingEntries));
    return { month, leaders: rankedEntries.slice(0, 5), currentUser: rankedEntries.find((entry) => entry.userId === String(currentUserId)) || null, entries: rankedEntries };
  }

  #createStandingEntry(roster, user, playerPoints) {
    const selectedPlayerIds = roster.slots?.map((slot) => slot.playerId).filter(Boolean) || [];
    return {
      userId: user.id,
      name: user.name || "Менеджер",
      points: selectedPlayerIds.reduce((sum, playerId) => sum + (playerPoints.get(playerId) || 0), 0),
      playersCount: selectedPlayerIds.length,
      slots: roster.slots || [],
    };
  }

  #assignPlaces(entries) {
    let previousPoints = null; let currentPlace = 0;
    return entries.map((entry, index) => {
      if (entry.points !== previousPoints) currentPlace = index + 1;
      previousPoints = entry.points; return { ...entry, place: currentPlace };
    });
  }

  #compareStandingEntries(first, second) {
    return second.points - first.points || first.name.localeCompare(second.name, "ru");
  }
}
