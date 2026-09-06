export class CompositeNotificationPlanner {
  constructor(planners) { this.planners = planners; }

  async createNotificationJobs(calendar, users, now = Date.now()) {
    const groups = await Promise.all(this.planners.map((planner) => planner.createNotificationJobs(calendar, users, now)));
    return groups.flat();
  }
}
