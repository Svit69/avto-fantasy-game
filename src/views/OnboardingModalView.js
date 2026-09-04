export class OnboardingModalView {
  render(step, index, total) {
    const isLast = index === total - 1;
    return `
      <div class="onboarding-backdrop" data-onboarding-skip></div>
      <section class="onboarding-modal" role="dialog" aria-modal="true" aria-label="Обучение">
        <button class="onboarding-skip" type="button" data-onboarding-skip>Пропустить</button>
        <div class="onboarding-progress">${this.#renderProgress(index, total)}</div>
        <div class="onboarding-card">
          <span>${step.accent}</span>
          <h2>${step.title}</h2>
          <p>${step.text}</p>
        </div>
        <div class="onboarding-actions">
          <button type="button" data-onboarding-prev ${index === 0 ? "disabled" : ""}>Назад</button>
          <button type="button" data-onboarding-next>${isLast ? "Готово" : "Дальше"}</button>
        </div>
      </section>
    `;
  }

  #renderProgress(index, total) {
    return Array.from({ length: total }, (_, itemIndex) => {
      const activeClass = itemIndex <= index ? " is-active" : "";
      return `<i class="${activeClass}"></i>`;
    }).join("");
  }
}
