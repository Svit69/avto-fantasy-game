export class ApplicationStartupController {
  constructor(rootElement, shellRenderer) { Object.assign(this, { rootElement, shellRenderer }); }
  async initialize(initializeAuthorizedApplication) {
    this.shellRenderer.renderApplicationShell(this.rootElement);
    try { await initializeAuthorizedApplication(); this.shellRenderer.completeLoading(); }
    catch { this.shellRenderer.failLoading(); }
  }
}
