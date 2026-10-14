export class LinuxResourceParser {
  parseMemory(text) {
    const fields = Object.fromEntries(text.trim().split("\n").map((line) => { const [name, value] = line.split(":"); return [name, Number(value?.trim().split(/\s+/)[0]) * 1024]; }));
    return { availableMemoryBytes: fields.MemAvailable, totalMemoryBytes: fields.MemTotal, swapUsedBytes: fields.SwapTotal - fields.SwapFree };
  }
  parseCpu(text) {
    const fields = text.split("\n")[0].trim().split(/\s+/).slice(1, 9).map(Number);
    return { idle: fields[3] + fields[4], total: fields.reduce((sum, value) => sum + value, 0) };
  }
  parseSwapActivity(text) {
    return text.split("\n").filter((line) => /^pswp(in|out) /.test(line)).reduce((sum, line) => sum + Number(line.split(/\s+/)[1]), 0);
  }
}
