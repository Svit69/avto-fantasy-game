export class DocumentScrollLock {
  constructor(documentBody = document.body, browserWindow = window) {
    Object.assign(this, { documentBody, browserWindow });
    this.lockClassName = null;
    this.scrollOffset = 0;
  }

  lock(lockClassName) {
    if (this.lockClassName) return;
    this.scrollOffset = this.browserWindow.scrollY;
    this.lockClassName = lockClassName;
    this.documentBody.style.top = `-${this.scrollOffset}px`;
    this.documentBody.classList.add(lockClassName, "is-document-scroll-locked");
  }

  unlock() {
    if (!this.lockClassName) return;
    const restoredScrollOffset = this.scrollOffset;
    this.documentBody.classList.remove(this.lockClassName, "is-document-scroll-locked");
    this.documentBody.style.removeProperty("top");
    this.lockClassName = null;
    this.browserWindow.scrollTo(0, restoredScrollOffset);
  }
}
