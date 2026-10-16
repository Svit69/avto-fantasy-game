for (const name of ["planner", "delivery", "scheduler", "dispatcher", "admin", "directory", "storage", "access", "http"]) await import(`./player-video-${name}-self-test.js`);
