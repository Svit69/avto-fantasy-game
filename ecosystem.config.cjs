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
  ],
};
