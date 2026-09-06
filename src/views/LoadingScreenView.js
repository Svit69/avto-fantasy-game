export class LoadingScreenView {
  render() {
    return `<section class="loading-screen" data-loading-screen aria-live="polite">
      <div class="loading-emblem"><img src="/assets/avto_logo.png" alt="" decoding="async" /></div>
      <p>Авто Фэнтези</p>
      <h1>Загружаем состав</h1>
      <div class="loading-progress"><span data-loading-progress-bar></span></div>
      <strong data-loading-progress-value>0%</strong>
    </section>`;
  }
}
