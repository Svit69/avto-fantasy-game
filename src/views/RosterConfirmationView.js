export class RosterConfirmationView {
  render(tourState, month) {
    const title = tourState?.title || `${month}: состав`;
    return `<div class="roster-confirmation-backdrop" data-close-roster-confirmation></div>
      <section class="roster-confirmation" role="dialog" aria-modal="true" aria-labelledby="roster-confirmation-title">
        <button class="roster-confirmation-close" type="button" data-close-roster-confirmation aria-label="Закрыть">×</button>
        <p class="roster-confirmation-kicker">${title}</p>
        <h2 id="roster-confirmation-title">Состав сохранён</h2>
        <p class="roster-confirmation-lead">До ${this.#formatDeadline(tourState?.deadlineAt)} его можно изменить без ограничений.</p>
        <ol class="roster-confirmation-steps">
          <li><b>Сейчас</b><span>Состав принят и участвует в туре.</span></li>
          <li><b>До дедлайна</b><span>Можно заменить игроков и сохранить состав заново.</span></li>
          <li><b>После первого матча</b><span>Откроется таблица с результатами менеджеров.</span></li>
        </ol>
        <div class="roster-confirmation-actions">
          <button type="button" data-close-roster-confirmation>Понятно</button>
          <button type="button" data-open-scoring-guide>Как начисляются ФО</button>
        </div>
      </section>`;
  }

  #formatDeadline(value) {
    const date = new Date(value); if (!Number.isFinite(date.getTime())) return "начала тура";
    return date.toLocaleString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
  }
}
