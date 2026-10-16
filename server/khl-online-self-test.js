for (const module of ["parser", "edge", "priority", "repository", "workflow", "stream", "notifier", "persistence"]) await import(`./khl-online-${module}-self-test.js`);
