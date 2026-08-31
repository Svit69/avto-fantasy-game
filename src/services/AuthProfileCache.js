export class AuthProfileCache {
  constructor(storageKey = "avto-fantasy-profile") {
    this.storageKey = storageKey;
  }

  saveProfile(profile) {
    sessionStorage.setItem(this.storageKey, JSON.stringify(profile));
  }

  loadProfile() {
    try {
      return JSON.parse(sessionStorage.getItem(this.storageKey) || "null");
    } catch {
      return null;
    }
  }
}
