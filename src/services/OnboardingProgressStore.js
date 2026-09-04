export class OnboardingProgressStore {
  constructor(userId = "guest", storagePrefix = "avto-fantasy-onboarding-completed") {
    this.storageKey = `${storagePrefix}-${userId}`;
  }

  isOnboardingCompleted() {
    return localStorage.getItem(this.storageKey) === "yes";
  }

  markOnboardingCompleted() {
    localStorage.setItem(this.storageKey, "yes");
  }
}
