import { MonthlyStandingsReportService } from "./MonthlyStandingsReportService.js";
import { StandingsPageFactory } from "./StandingsPageFactory.js";

export class StandingsController {
  constructor(options) {
    Object.assign(this, { jsonResponder: options.jsonResponder, profileResolver: options.profileResolver,
      reports: options.reports || new MonthlyStandingsReportService(options) });
  }

  async handleRequest(request, response) {
    if (request.method !== "GET") return this.jsonResponder.sendJson(response, 405, { error: "method_not_allowed" });
    const profile = await this.profileResolver.resolveProfile(request);
    if (!profile) return this.jsonResponder.sendJson(response, 401, { error: "invalid_init_data" });
    const params = new URL(request.url, `http://${request.headers.host}`).searchParams;
    const month = params.get("month") || "Сентябрь";
    const report = await this.reports.loadMonthlyReport(month);
    const standings = new StandingsPageFactory().createResponse(report, profile.id, params);
    return this.jsonResponder.sendJson(response, 200, { ok: true, standings });
  }
}
