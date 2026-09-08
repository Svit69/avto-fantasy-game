import fs from "node:fs/promises";
import path from "node:path";
import { KhlMatchDataRepository } from "./KhlMatchDataRepository.js";
import { KhlMatchIngestionService } from "./KhlMatchIngestionService.js";
import { KhlMatchScopePolicy } from "./KhlMatchScopePolicy.js";
import { KhlProtocolPdfDataProvider } from "./KhlProtocolPdfDataProvider.js";

export class KhlProtocolPdfSelfTestRunner {
  constructor({ temp, playerCatalogRepository }) { Object.assign(this, { temp, playerCatalogRepository }); }

  async runIfConfigured(pdfPath) {
    if (!pdfPath) return;
    const repository = new KhlMatchDataRepository(path.join(this.temp, "khl-pdf.json"));
    const players = await this.playerCatalogRepository.listPlayers();
    const identity = { tournamentId: "1369", gameId: "898099", homeTeamId: "190", league: "КХЛ" };
    const provider = new KhlProtocolPdfDataProvider({ pdfBuffer: await fs.readFile(pdfPath), players, identity });
    await new KhlMatchIngestionService({ dataProvider: provider, repository, playerCatalogRepository: this.playerCatalogRepository, scopePolicy: new KhlMatchScopePolicy("190") }).ingestMatch("1369", "898099");
    await this.#assertSprongShotsOnGoal(repository);
  }

  async #assertSprongShotsOnGoal(repository) {
    const sprong = (await repository.listStatsByGameId("898099")).find((stat) => stat.playerId === "sprong");
    if (sprong && sprong.shotsOnGoal !== 6) throw new Error("khl_pdf_shots_on_goal_self_test_failed");
  }
}
