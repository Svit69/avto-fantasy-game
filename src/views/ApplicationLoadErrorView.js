export class ApplicationLoadErrorView {
  render() {
    return `<div class="loading-emblem"><img src="/assets/avto_logo.png" alt="" /></div>
      <h1>Не удалось загрузить данные</h1>
      <p class="loading-error-message" role="alert">Проверьте соединение и повторите загрузку.</p>
      <button class="loading-retry-button" type="button" data-retry-application>Повторить загрузку</button>`;
  }
}
