const assetVersion = "2026-10-10-player-photos-2";

export function versionAssetUrl(assetUrl) {
  if (!assetUrl || !assetUrl.startsWith("/assets/")) return assetUrl;
  const separator = assetUrl.includes("?") ? "&" : "?";
  return `${assetUrl}${separator}v=${assetVersion}`;
}
