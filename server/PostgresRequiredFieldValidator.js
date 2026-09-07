export class PostgresRequiredFieldValidator {
  assertRequiredValue(fieldName, value) {
    if (value === null || value === undefined || value === "") {
      throw new Error(`DATABASE_REQUIRED_VALUE_MISSING:${fieldName}`);
    }
  }
}
