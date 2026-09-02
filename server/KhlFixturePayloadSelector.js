export class KhlFixturePayloadSelector {
  selectImportablePayload(payloads) {
    const payload = payloads.find((item) => item.match || item.events || item.playByPlay) || payloads[0];
    if (!payload) throw new Error("khl_fixture_payload_missing");
    return { ...payload, events: payload.events || payload.playByPlay || [] };
  }
}
