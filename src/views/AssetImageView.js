import { versionAssetUrl } from "../utils/AssetUrlVersioner.js";

export class AssetImageView {
  renderAsset({ className = "", src, alt = "", loading = "lazy", decoding = "async", priority = "auto", fallback = "" }) {
    const attributes = [`src="${versionAssetUrl(src)}"`, `alt="${alt}"`, `decoding="${decoding}"`, `draggable="false"`];
    if (className) attributes.push(`class="${className}"`);
    if (loading) attributes.push(`loading="${loading}"`);
    if (priority !== "auto") attributes.push(`fetchpriority="${priority}"`);
    attributes.push('referrerpolicy="no-referrer"', 'oncontextmenu="return false"');
    if (fallback) attributes.push(`onerror="this.onerror=null;this.src='${versionAssetUrl(fallback)}'"`);
    return `<img ${attributes.join(" ")} />`;
  }

  renderPlayerImage(options) {
    return this.renderAsset({ fallback: "/assets/avto_logo.png", ...options });
  }
}
