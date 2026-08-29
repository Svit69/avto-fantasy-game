export class PriceRangeFilterView {
  render(filters, priceRange) {
    const currentPrice = Math.min(filters.maxPrice, priceRange.max);
    const progress = this.#calculateProgress(currentPrice, priceRange);

    return `
      <div class="price-range-shell">
        <div class="price-range-summary">
          <span>${priceRange.min}к</span>
          <output>до ${currentPrice}к</output>
          <strong>${priceRange.max}к</strong>
        </div>
        <input style="--price-progress: ${progress}%" type="range" min="${priceRange.min}" max="${priceRange.max}"
          step="1" value="${currentPrice}" data-price-filter-range />
      </div>
    `;
  }

  #calculateProgress(currentPrice, priceRange) {
    return ((currentPrice - priceRange.min) / (priceRange.max - priceRange.min)) * 100;
  }
}
