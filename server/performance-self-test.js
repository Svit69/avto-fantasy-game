for (const name of ["cache", "points", "report", "pages", "menu", "loader", "load"]) await import(`./performance-${name}-self-test.js`);
