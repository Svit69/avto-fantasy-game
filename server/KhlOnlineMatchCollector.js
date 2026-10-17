import { KhlMirrorDataProvider } from "./KhlMirrorDataProvider.js";
import { KhlOnlineImportGuard } from "./KhlOnlineImportGuard.js";
import { OnlineHockeyLeagueConfiguration } from "./OnlineHockeyLeagueConfiguration.js";

export class KhlOnlineMatchCollector {
  constructor({ factory, notifier, finalDelayMs = 1200000, providerFactory = (options) => new KhlMirrorDataProvider(options), clock = Date.now, configuration = OnlineHockeyLeagueConfiguration.khl() }) {
    Object.assign(this, { factory, notifier, finalDelayMs, providerFactory, clock, configuration });
  }
  async collectMatch(calendarMatch, state, now) {
    await this.notifier?.notifyOnce(calendarMatch, "prepared");
    const gameId = calendarMatch[this.configuration.gameIdField];
    const protectedMatch = await new KhlOnlineImportGuard().findProtectedImport(this.factory.createRepository(), {
      ...calendarMatch, gameId, scheduledAt: calendarMatch.startsAt, sourceType: `${this.configuration.key}-online`,
    });
    if (protectedMatch) return this.#completeProtected(calendarMatch, state, now, protectedMatch);
    const players = await this.factory.createPlayerCatalogRepository().listPlayers();
    const provider = this.providerFactory({ gameId, players, expectedMatch: calendarMatch });
    const match = await provider.getMatch();
    now = Math.max(now, this.clock());
    if (match.status === "scheduled") return { ok: true, state: { ...state, failures: 0 } };
    await this.notifier?.notifyOnce(calendarMatch, "start", { match });
    const result = await this.factory.createIngestionService(provider).ingestMatch(calendarMatch.tourId, gameId);
    if (result.reason === "manual_protocol_priority") return this.#completeProtected(calendarMatch, state, now, result.match);
    if (!result.ok) throw new Error(result.reason);
    const finishedAt = match.status === "finished" ? state.finishedAt || now : null;
    const finalReady = finishedAt && now >= finishedAt + this.finalDelayMs;
    if (finalReady) await this.notifier?.notifyOnce(calendarMatch, "final", result, players,
      provider.unmatchedPlayers.length ? `Не найдены в базе: ${provider.unmatchedPlayers.join(", ")}` : "Все участники привязаны к базе игроков.");
    else if (match.status !== "finished") await this.notifier?.notifyOnce(calendarMatch, "interim", result);
    return { ok: true, matchId: calendarMatch.id, players: result.playerStats.length,
      state: { ...state, failures: 0, finishedAt, completedAt: finalReady ? now : null } };
  }
  async #completeProtected(match, state, now, protectedMatch) {
    await this.notifier?.notifyOnce(match, "protected", { match: protectedMatch }, [], "Онлайн-данные не заменяют загруженный протокол.");
    return { ok: true, reason: "manual_protocol_priority", state: { ...state, completedAt: now, failures: 0 } };
  }
}
