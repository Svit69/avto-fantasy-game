export class FantasyCalendarPayloadValidator {
  validatePayload(payload) {
    if (!Array.isArray(payload?.tours) || !Array.isArray(payload?.matches)) throw new Error("invalid_calendar_payload");
    const months = new Set(); const ids = new Set();
    for (const tour of payload.tours) {
      if (!tour?.id || !tour.month || ids.has(tour.id) || months.has(tour.month)
        || !Number.isFinite(Date.parse(tour.deadlineAt || tour.startsAt))) throw new Error("invalid_calendar_tour");
      ids.add(tour.id); months.add(tour.month);
    }
    return { tours: payload.tours, matches: payload.matches, opponents: Array.isArray(payload.opponents) ? payload.opponents : [] };
  }
}
