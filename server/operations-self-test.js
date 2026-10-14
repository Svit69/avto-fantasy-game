for (const file of ["queue", "body", "monitor", "worker", "client", "fetch-context", "http", "integration", "probe", "configuration", "entry"]) await import(`./operations-${file}-self-test.js`);
