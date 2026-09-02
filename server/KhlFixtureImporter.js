import fs from "node:fs/promises";
import path from "node:path";
import { KhlFixtureDirectory } from "./KhlFixtureDirectory.js";
import { KhlFixtureIdentityResolver } from "./KhlFixtureIdentityResolver.js";
import { KhlFixturePayloadSelector } from "./KhlFixturePayloadSelector.js";
import { KhlFixtureWriter } from "./KhlFixtureWriter.js";
import { KhlHarPayloadExtractor } from "./KhlHarPayloadExtractor.js";
import { KhlSensitiveHeaderSanitizer } from "./KhlSensitiveHeaderSanitizer.js";

export class KhlFixtureImporter {
  constructor(rootDirectory, sanitizer = new KhlSensitiveHeaderSanitizer(), selector = new KhlFixturePayloadSelector()) {
    Object.assign(this, { directory: new KhlFixtureDirectory(rootDirectory), sanitizer, selector, writer: new KhlFixtureWriter(), identityResolver: new KhlFixtureIdentityResolver(), harExtractor: new KhlHarPayloadExtractor() });
  }

  async importSource(sourcePath) {
    const stat = await fs.stat(sourcePath);
    if (stat.isDirectory()) return this.#importDirectory(sourcePath);
    const payload = JSON.parse(await fs.readFile(sourcePath, "utf8"));
    return sourcePath.endsWith(".har") ? this.#importHar(sourcePath, payload) : this.#importPayload(sourcePath, payload, payload);
  }

  async #importDirectory(sourcePath) {
    const manifest = JSON.parse(await fs.readFile(path.join(sourcePath, "manifest.json"), "utf8"));
    const target = this.directory.resolveMatchDirectory(manifest.tournamentId, manifest.gameId);
    await fs.cp(sourcePath, target, { recursive: true });
    return { tournamentId: manifest.tournamentId, gameId: manifest.gameId, fixtureDirectory: target };
  }

  async #importHar(sourcePath, har) {
    const sanitizedHar = this.sanitizer.sanitizeHar(har);
    return this.#importPayload(sourcePath, this.selector.selectImportablePayload(this.harExtractor.extractPayloads(sanitizedHar)), sanitizedHar);
  }

  async #importPayload(sourcePath, payload, rawSnapshot) {
    const identity = this.identityResolver.resolvePayloadIdentity(payload, sourcePath);
    const normalized = { ...payload, match: { ...payload.match, ...identity }, events: payload.events || payload.playByPlay || [] };
    const fixtureDirectory = this.directory.resolveMatchDirectory(identity.tournamentId, identity.gameId);
    await this.writer.writeFixture(fixtureDirectory, normalized, rawSnapshot);
    return { ...identity, fixtureDirectory };
  }
}
