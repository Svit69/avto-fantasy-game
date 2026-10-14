export class RosterAnimationController {
  constructor(rootElement) { this.rootElement = rootElement; }
  animateRosterLock() { this.#setAnimation("is-roster-locking", "is-roster-editing"); }
  animateRosterEdit() { this.#setAnimation("is-roster-editing", "is-roster-locking"); }
  #setAnimation(nextClass, previousClass) {
    const field = this.rootElement.querySelector("[data-draft-field]");
    field?.classList.remove(previousClass); field?.classList.add(nextClass);
  }
}
