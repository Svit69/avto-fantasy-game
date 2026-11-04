for (const module of ["parser", "validation", "priority", "stream", "worker", "factory"]) await import(`./mhl-online-${module}-self-test.js`);
await import("./mhl-goalie-fallback-self-test.js");
await import("./mhl-903310-identity-self-test.js");
await import("./online-schedule-self-test.js");
