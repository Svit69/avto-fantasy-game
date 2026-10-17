for (const module of ["parser", "validation", "priority", "stream", "worker", "factory"]) await import(`./mhl-online-${module}-self-test.js`);
