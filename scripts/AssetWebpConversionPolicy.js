export class AssetWebpConversionPolicy {
  createOptions(filePath) {
    return { quality: this.#resolveQuality(filePath), effort: 5 };
  }

  shouldKeepConvertedFile(sourceSize, targetSize) {
    return targetSize > 0 && targetSize < sourceSize;
  }

  #resolveQuality(filePath) {
    if (filePath.includes("/players/") || filePath.includes("\\players\\")) return 82;
    if (filePath.includes("texture") || filePath.includes("layer")) return 76;
    return 86;
  }
}
