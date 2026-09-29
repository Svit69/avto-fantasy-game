export class FantasyScoringGuideView {
  render(guide) {
    return `<div class="scoring-guide-backdrop" data-close-scoring-guide></div>
      <section class="scoring-guide" role="dialog" aria-modal="true" aria-labelledby="scoring-guide-title">
        <header><div><p>Правила игры</p><h2 id="scoring-guide-title">Как начисляются ФО</h2></div><button type="button" data-close-scoring-guide aria-label="Закрыть">×</button></header>
        <div class="scoring-guide-body">
          <section><h3>Как получается результат</h3><ol class="scoring-formula"><li><b>ФО за матч</b><span>События игрока × коэффициент лиги, результат округляется.</span></li><li><b>Среднее игрока</b><span>Сумма ФО за матчи тура ÷ количество сыгранных матчей.</span></li><li><b>Результат состава</b><span>Сумма средних ФО всех 6 выбранных игроков.</span></li></ol></section>
          <section><h3>Коэффициенты лиг</h3><div class="scoring-leagues">${guide.leagues.map((row) => `<div><span>${row.label}</span><b>${row.value}</b></div>`).join("")}</div></section>
          <section><h3>Полевые игроки</h3>${this.#renderSkaterTable(guide.skaters)}</section>
          <section><h3>Вратари</h3><div class="scoring-rules">${guide.goalkeepers.map((row) => this.#renderRule(row.label, row.value)).join("")}</div></section>
          <section class="scoring-example"><h3>Пример</h3><p>Игрок МХЛ набрал 65 базовых очков: <b>65 × 0,5 = 32,5 → 33 ФО за матч</b>.</p></section>
        </div>
        <footer><button type="button" data-close-scoring-guide>Понятно</button></footer>
      </section>`;
  }

  #renderSkaterTable(rows) {
    return `<div class="scoring-table" role="table"><div class="scoring-table-head" role="row"><span>Событие</span><b>НАП</b><b>ЗАЩ</b></div>${rows.map((row) => `<div role="row"><span>${row.label}</span><b>${this.#formatPoints(row.forward)}</b><b>${this.#formatPoints(row.defender)}</b></div>`).join("")}</div>`;
  }

  #renderRule(label, value) { return `<div><span>${label}</span><b>${this.#formatPoints(value)}</b></div>`; }
  #formatPoints(value) { return `${value > 0 ? "+" : ""}${value}`; }
}
