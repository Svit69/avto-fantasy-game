import { OnlineHockeyLeagueConfiguration } from "./OnlineHockeyLeagueConfiguration.js";
import { KhlWorkerMonitor } from "./KhlWorkerMonitor.js";

export class MirrorWorkerMonitorReader {
  constructor(store) { this.store = store; }
  async readWorkers() {
    const result = { conditions: [] };
    for (const configuration of [OnlineHockeyLeagueConfiguration.khl(), OnlineHockeyLeagueConfiguration.mhl()]) {
      const worker = await this.store.readState(`${configuration.key}-heartbeat.json`).catch(() => null);
      result[`${configuration.key}Worker`] = worker;
      result.conditions.push(...new KhlWorkerMonitor(configuration).evaluateConditions(worker));
    }
    return result;
  }
}
