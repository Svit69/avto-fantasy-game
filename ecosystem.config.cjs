module.exports = {
  apps: [
    {
      name: "avto-fantasy-game",
      script: "server/server.js",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
