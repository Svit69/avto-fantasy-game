import fs from "node:fs";

export class EnvironmentFileLoader {
  loadEnvironmentFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
    for (const line of lines) this.#assignEnvironmentVariable(line);
  }

  #assignEnvironmentVariable(line) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) return;
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    if (!process.env[key]) process.env[key] = this.#removeWrappingQuotes(value);
  }

  #removeWrappingQuotes(value) {
    return value.replace(/^["']|["']$/g, "");
  }
}
