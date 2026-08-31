const assetVersion = "2026-08-31-mhk-auto-roster";

export function versionAssetUrl(assetUrl) {
  if (!assetUrl || !assetUrl.startsWith("/assets/")) return assetUrl;
  const separator = assetUrl.includes("?") ? "&" : "?";
  return `${assetUrl}${separator}v=${assetVersion}`;
}
