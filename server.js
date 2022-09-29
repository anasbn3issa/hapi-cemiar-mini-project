"use strict";

const Hapi = require("@hapi/hapi");

const init = async () => {
  const server = Hapi.Server({
    port: 3000,
    host: "localhost",
  });

  server.route([
    {
      method: "GET",
      path: "/",
      handler: (request, h) => {
        return "<h1>Hello World!</h1>";
      },
    },
    {
      method: "GET",
      path: "/users",
      handler: (request, h) => {
        return h.redirect("/");
      },
    },
    {
      method: "GET",
      path: "/{any*}",
      handler: (request, h) => {
        return "<h1>404 Not Found</h1>";
      },
    },
  ]);

  await server.start();
  console.log("Server running on %s", server.info.uri);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
