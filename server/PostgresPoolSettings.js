import { OperationalSettings as Settings } from "./OperationalSettings.js";

export class PostgresPoolSettings {
  createOptions(connectionString) {
    return { connectionString, max: Settings.readNumber("PG_POOL_MAX", 4, 1, 20),
      connectionTimeoutMillis: Settings.readNumber("PG_CONNECTION_TIMEOUT_MS", 3000),
      idleTimeoutMillis: Settings.readNumber("PG_IDLE_TIMEOUT_MS", 10000),
      statement_timeout: Settings.readNumber("PG_STATEMENT_TIMEOUT_MS", 30000),
      idle_in_transaction_session_timeout: Settings.readNumber("PG_IDLE_TRANSACTION_TIMEOUT_MS", 30000) };
  }
}
