export function createTourLoadingFixture() {
  const now = Date.now();
  const tours = ["past", "current", "next", "closed"].map((month, index) => ({ id: month, month, title: month,
    deadlineAt: new Date(now + (index - 1.5) * 86400000).toISOString(),
    endsAt: new Date(now + (index - 0.5) * 86400000).toISOString() }));
  return { now, calendar: { tours, matches: [], opponents: [] } };
}
