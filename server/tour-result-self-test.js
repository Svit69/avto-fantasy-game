for (const name of ["readiness", "snapshot", "messages", "planner", "dispatcher", "scheduler", "worker"]) await import(`./tour-result-${name}-self-test.js`);
