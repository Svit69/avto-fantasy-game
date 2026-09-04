module.exports = {
  apps: [
    {
      name: "avto-fantasy",
      script: "server/server.js",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
    {
      name: "avto-fantasy-vhl-poll",
      script: "server/vhl-poll-online.js",
      env: { NODE_ENV: "production" },
    },
  ],
};
