import { versionAssetUrl } from "../utils/AssetUrlVersioner.js";

export class RosterAssetPreloader {
  #loadedAssetUrls = new Set();

  async preloadRosterVisualAssets(roster) {
    await Promise.all(this.#collectRosterAssetUrls(roster).map((url) => this.#preloadImageAsset(url)));
  }

  #collectRosterAssetUrls(roster) {
    const urls = ["/assets/card_bottom_layer.png", "/assets/card_top_layer.png"];
    roster.getSlots().forEach((slot) => this.#appendSlotAssetUrls(urls, slot));
    return [...new Set(urls.filter(Boolean).map(versionAssetUrl))];
  }

  #appendSlotAssetUrls(urls, slot) {
    if (!slot.isFilled()) return;
    const props = slot.getPlayer().getCardProps(true);
    urls.push(props.image, props.leagueLogo);
  }

  #preloadImageAsset(assetUrl) {
    if (this.#loadedAssetUrls.has(assetUrl)) return Promise.resolve();
    return new Promise((resolve) => {
      const image = new Image();
      const completeLoading = () => { this.#loadedAssetUrls.add(assetUrl); resolve(); };
      image.onload = completeLoading; image.onerror = completeLoading; image.src = assetUrl;
      image.decode?.().then(completeLoading).catch(completeLoading);
    });
  }
}
