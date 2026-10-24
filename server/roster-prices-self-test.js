for (const name of ["policy", "storage", "service", "notifications", "http", "scheduler"]) await import(`./roster-prices-${name}-self-test.js`);
