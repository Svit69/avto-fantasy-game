import assert from "node:assert/strict";
import { PostgresPoolSettings } from "./PostgresPoolSettings.js";
import { SharedSecretVerifier } from "./SharedSecretVerifier.js";
import { ApplicationDataRevision } from "./ApplicationDataRevision.js";
import { DatabaseReadinessProbe } from "./DatabaseReadinessProbe.js";

const options = new PostgresPoolSettings().createOptions("postgresql://test");
assert(options.max > 0 && options.max <= 20); assert(options.connectionTimeoutMillis > 0);
assert(options.statement_timeout > 0 && options.idle_in_transaction_session_timeout > 0);
const secret = new SharedSecretVerifier();
assert(secret.matches("секрет", "секрет")); assert(!secret.matches("other", "секрет")); assert(!secret.matches("", ""));
const revision = new ApplicationDataRevision({ readState: async () => null, writeState: async () => { throw Object.assign(new Error("disk full"), { code: "ENOSPC" }); } });
const previous = await revision.readRevision(); const warn = console.warn; console.warn = () => {};
try { assert.equal(await revision.invalidateReports(), false); } finally { console.warn = warn; }
assert.notEqual(await revision.readRevision(), previous, "A successful price write must invalidate local cache even when shared disk is full");
const oldDriver = process.env.STORAGE_DRIVER; process.env.STORAGE_DRIVER = "json";
try { assert.deepEqual(await new DatabaseReadinessProbe().checkReadiness(), { ok: true, database: "not_configured" }); }
finally { if (oldDriver === undefined) delete process.env.STORAGE_DRIVER; else process.env.STORAGE_DRIVER = oldDriver; }
console.log("Operations configuration and cache disk-failure self-test passed");
