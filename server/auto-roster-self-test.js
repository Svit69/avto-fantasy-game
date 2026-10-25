for (const name of ["selection", "candidates", "service", "bot", "reminders", "http"]) await import(`./auto-roster-${name}-self-test.js`);
