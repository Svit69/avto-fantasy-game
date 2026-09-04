import { ONBOARDING_STEPS } from "../data/onboardingSteps.js";
import { OnboardingProgressStore } from "../services/OnboardingProgressStore.js";
import { OnboardingModalView } from "../views/OnboardingModalView.js";

export class OnboardingController {
  constructor(rootElement, userId = "guest", progressStore = new OnboardingProgressStore(userId), view = new OnboardingModalView()) {
    Object.assign(this, { rootElement, progressStore, view, currentStepIndex: 0 });
  }

  connectOnboarding() {
    if (this.progressStore.isOnboardingCompleted()) return;
    this.#renderCurrentStep();
    this.#getRoot().addEventListener("click", (event) => this.#handleOnboardingClick(event));
  }

  #handleOnboardingClick(event) {
    if (event.target.closest("[data-onboarding-skip]")) return this.#completeOnboarding();
    if (event.target.closest("[data-onboarding-prev]")) return this.#showPreviousStep();
    if (event.target.closest("[data-onboarding-next]")) return this.#showNextStep();
  }

  #showPreviousStep() {
    this.currentStepIndex = Math.max(0, this.currentStepIndex - 1);
    this.#renderCurrentStep();
  }

  #showNextStep() {
    if (this.currentStepIndex >= ONBOARDING_STEPS.length - 1) return this.#completeOnboarding();
    this.currentStepIndex += 1;
    this.#renderCurrentStep();
  }

  #completeOnboarding() {
    this.progressStore.markOnboardingCompleted();
    this.#getRoot().innerHTML = "";
  }

  #renderCurrentStep() {
    this.#getRoot().innerHTML = this.view.render(ONBOARDING_STEPS[this.currentStepIndex], this.currentStepIndex, ONBOARDING_STEPS.length);
  }

  #getRoot() {
    return this.rootElement.querySelector("[data-onboarding-root]");
  }
}
