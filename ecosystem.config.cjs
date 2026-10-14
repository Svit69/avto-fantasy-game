module.exports = {
  apps: [
    {
      name: "avto-fantasy",
      cwd: __dirname,
      script: "server/server.js",
      instances: 1,
      exec_mode: "fork",
      min_uptime: "30s",
      exp_backoff_restart_delay: 1000,
      max_restarts: 10,
      ...(process.env.APP_MAX_MEMORY_RESTART ? { max_memory_restart: process.env.APP_MAX_MEMORY_RESTART } : {}),
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        PG_POOL_MAX: 4,
      },
    },
    {
      name: "avto-fantasy-vhl-poll",
      cwd: __dirname,
      script: "server/vhl-poll-online.js",
      instances: 1,
      exec_mode: "fork",
      min_uptime: "30s",
      exp_backoff_restart_delay: 1000,
      max_restarts: 10,
      ...(process.env.VHL_MAX_MEMORY_RESTART ? { max_memory_restart: process.env.VHL_MAX_MEMORY_RESTART } : {}),
      env: { NODE_ENV: "production", PG_POOL_MAX: 2 },
    },
  ],
};
