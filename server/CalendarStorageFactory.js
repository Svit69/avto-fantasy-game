import { StorageDriverFactory } from "./StorageDriverFactory.js";

export class CalendarStorageFactory {
  constructor(resolveStoragePath) {
    this.storageFactory = new StorageDriverFactory(resolveStoragePath);
  }

  createCalendarRepository() {
    return this.storageFactory.createCalendarRepository();
  }

  createOpponentTeamRepository() {
    return this.storageFactory.createOpponentTeamRepository();
  }
}
