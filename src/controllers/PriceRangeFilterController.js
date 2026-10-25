export class PriceRangeFilterController {
  constructor({ rootElement, state, onChange }) { Object.assign(this, { rootElement, state, onChange }); }
  connect() {
    this.rootElement.addEventListener("input", (event) => {
      if (event.target.matches("[data-price-filter-range]")) this.#applyPrice(event.target);
    });
    this.rootElement.addEventListener("click", (event) => {
      const button = event.target.closest("[data-price-step], [data-reset-price]");
      if (!button || button.disabled) return;
      const input = button.closest(".price-range-shell").querySelector("[data-price-filter-range]");
      input.value = button.hasAttribute("data-reset-price") ? input.max : Number(input.value) + Number(button.dataset.priceStep);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
  }
  #applyPrice(input) {
    const price = Number(input.value); const min = Number(input.min); const max = Number(input.max);
    this.state.applyFilter("price", price);
    input.style.setProperty("--price-progress", `${max > min ? (price - min) / (max - min) * 100 : 100}%`);
    input.setAttribute("aria-valuetext", `до ${price}к`);
    const shell = input.closest(".price-range-shell");
    shell.querySelector("[data-price-filter-output]").value = `до ${price}к`;
    shell.querySelector('[data-price-step="-1"]').disabled = price <= min;
    shell.querySelector('[data-price-step="1"]').disabled = price >= max;
    shell.querySelector("[data-reset-price]").disabled = price >= max;
    const label = this.rootElement.querySelector('[data-open-filter="price"] b');
    if (label) label.textContent = `до ${price}к`;
    this.onChange();
  }
}
