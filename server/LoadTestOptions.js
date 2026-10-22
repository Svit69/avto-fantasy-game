export class LoadTestOptions {
  parseArguments(args) {
    const values = {};
    for (let index = 0; index < args.length; index += 2) {
      if (!["--users", "--concurrency", "--sessions", "--think-ms"].includes(args[index]) || !args[index + 1]) throw new Error("Usage: npm run test:load -- --users 100,500,1000,2000 --concurrency 8 --sessions 50 --think-ms 20");
      values[args[index]] = args[index + 1];
    }
    const integer = (value, minimum, maximum) => {
      if (!/^\d+$/.test(String(value)) || Number(value) < minimum || Number(value) > maximum) throw new Error(`Expected integer ${minimum}..${maximum}`);
      return Number(value);
    };
    const users = [...new Set((values["--users"] || "100,500,1000,2000").split(",").map((value) => integer(value, 1, 5000)))];
    if (users.length > 6) throw new Error("At most six user levels per run");
    return { users, concurrency: integer(values["--concurrency"] || 8, 1, 100), sessions: integer(values["--sessions"] || 50, 1, 500), thinkMs: integer(values["--think-ms"] ?? 20, 0, 5000) };
  }
}
