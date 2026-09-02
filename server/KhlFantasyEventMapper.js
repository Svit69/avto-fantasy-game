export class KhlFantasyEventMapper {
  createFantasyEvents(event) {
    const events = [];
    if (event.eventType === "goal") events.push(this.#createEvent(event, "goals"), this.#createEvent(event, "shotsOnGoal"));
    if (event.eventType === "assist") events.push(this.#createEvent(event, "assists"));
    if (event.eventType === "penalty") events.push(this.#createEvent(event, "penalties"));
    if (event.eventType === "shot_on_goal") events.push(this.#createEvent(event, "shotsOnGoal"));
    if (event.eventType === "blocked_shot") events.push(this.#createEvent(event, "blockedShots"));
    if (event.eventType === "hit") events.push(this.#createEvent(event, "hits"));
    if (event.eventType === "takeaway") events.push(this.#createEvent(event, "takeaways"));
    if (event.eventType === "interception") events.push(this.#createEvent(event, "interceptions"));
    if (event.eventType === "save") events.push(this.#createEvent(event, "saves"));
    if (event.eventType === "goal_against") events.push(this.#createEvent(event, "goalsAgainst"));
    if (event.rawPayload?.goaliePlayerId && !event.rawPayload?.emptyNet) events.push({ ...this.#createEvent(event, "goalsAgainst"), khlPlayerId: String(event.rawPayload.goaliePlayerId) });
    return events.filter((entry) => entry.khlPlayerId);
  }

  #createEvent(event, eventType) { return { eventId: event.eventKey, eventType, khlPlayerId: event.playerId }; }
}
