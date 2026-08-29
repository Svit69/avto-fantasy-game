export class PlayerLongPressController {
  constructor(rootElement, players, teamRoster, profileView) {
    Object.assign(this, { rootElement, players, teamRoster, profileView });
    this.longPressTimer = null; this.pointerStart = null; this.shouldSuppressNextClick = false;
  }
  connectPlayerProfileActions() {
    this.rootElement.addEventListener("pointerdown", (event) => this.#scheduleProfileOpening(event));
    this.rootElement.addEventListener("pointermove", (event) => this.#cancelWhenPointerMoves(event));
    this.rootElement.addEventListener("pointerup", () => this.#cancelPendingOpening());
    this.rootElement.addEventListener("pointercancel", () => this.#cancelPendingOpening());
    this.rootElement.addEventListener("click", (event) => this.#handleProfileClick(event), true);
    this.rootElement.addEventListener("contextmenu", (event) => this.#preventContextMenu(event));
  }
  #scheduleProfileOpening(event) {
    const source = event.target.closest("[data-player-profile]");
    if (!source || event.target.closest("[data-remove-slot]")) return;
    this.pointerStart = { x: event.clientX, y: event.clientY };
    this.longPressTimer = setTimeout(() => this.#openProfile(source.dataset.playerProfile), 420);
  }
  #cancelWhenPointerMoves(event) {
    if (!this.pointerStart) return;
    const distance = Math.hypot(event.clientX - this.pointerStart.x, event.clientY - this.pointerStart.y);
    if (distance > 10) this.#cancelPendingOpening();
  }
  #handleProfileClick(event) {
    if (this.#suppressClickAfterLongPress(event)) return;
    if (event.target.closest("[data-close-player-profile]")) this.#closeProfile();
  }
  #suppressClickAfterLongPress(event) {
    if (!this.shouldSuppressNextClick) return false;
    event.preventDefault(); event.stopImmediatePropagation(); this.shouldSuppressNextClick = false;
    return true;
  }
  #preventContextMenu(event) { if (event.target.closest("[data-player-profile]")) event.preventDefault(); }
  #openProfile(playerId) {
    const player = this.players.find((candidate) => candidate.getId() === playerId);
    if (!player) return;
    this.shouldSuppressNextClick = true; document.body.classList.add("is-profile-open");
    this.#getProfileRoot().innerHTML = this.profileView.render(player, this.teamRoster.getSelectedPlayerIds().includes(playerId));
  }
  #closeProfile() { document.body.classList.remove("is-profile-open"); this.#getProfileRoot().innerHTML = ""; }
  #getProfileRoot() { return this.rootElement.querySelector("[data-player-profile-root]"); }
  #cancelPendingOpening() { clearTimeout(this.longPressTimer); this.longPressTimer = null; this.pointerStart = null; }
}
