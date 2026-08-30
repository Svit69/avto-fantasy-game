export class AdminAccessPolicy {
  constructor(adminIds) {
    this.adminIds = new Set(adminIds.map((id) => String(id).trim()).filter(Boolean));
  }

  canManageBot(userId) {
    return this.adminIds.has(String(userId));
  }

  hasAdministrators() {
    return this.adminIds.size > 0;
  }
}
