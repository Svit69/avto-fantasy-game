const assetVersion = "2026-09-06-web-fallback-loading";

export function versionAssetUrl(assetUrl) {
  if (!assetUrl || !assetUrl.startsWith("/assets/")) return assetUrl;
  const separator = assetUrl.includes("?") ? "&" : "?";
  return `${assetUrl}${separator}v=${assetVersion}`;
}
