export class PriceRangeFilterView {
  render(filters, priceRange) {
    const selectedPrice = filters.maxPrice ?? priceRange.max;
    const currentPrice = Math.max(priceRange.min, Math.min(selectedPrice, priceRange.max));
    const progress = this.#calculateProgress(currentPrice, priceRange);

    return `
      <div class="price-range-shell">
        <div class="price-range-summary">
          <span>Максимальная цена</span>
          <button type="button" data-reset-price ${currentPrice >= priceRange.max ? "disabled" : ""}>Сбросить</button>
        </div>
        <div class="price-range-value">
          <button type="button" data-price-step="-1" aria-label="Уменьшить цену" title="Уменьшить цену на 1к" ${currentPrice <= priceRange.min ? "disabled" : ""}>−</button>
          <output data-price-filter-output aria-live="polite">до ${currentPrice}к</output>
          <button type="button" data-price-step="1" aria-label="Увеличить цену" title="Увеличить цену на 1к" ${currentPrice >= priceRange.max ? "disabled" : ""}>+</button>
        </div>
        <input style="--price-progress: ${progress}%" type="range" min="${priceRange.min}" max="${priceRange.max}"
          step="1" value="${currentPrice}" aria-label="Максимальная цена игрока" aria-valuetext="до ${currentPrice}к"
          ${priceRange.min === priceRange.max ? "disabled" : ""} data-price-filter-range />
        <div class="price-range-limits" aria-hidden="true"><span>${priceRange.min}к</span><span>${priceRange.max}к</span></div>
      </div>
    `;
  }

  #calculateProgress(currentPrice, priceRange) {
    if (priceRange.max <= priceRange.min) return 100;
    return ((currentPrice - priceRange.min) / (priceRange.max - priceRange.min)) * 100;
  }
}
