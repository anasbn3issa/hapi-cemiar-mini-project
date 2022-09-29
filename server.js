"use strict";

const Hapi = require("@hapi/hapi");
const path = require("path");

const init = async () => {
  const server = Hapi.Server({
    port: 3000,
    host: "localhost",
    routes: {
        files: {
            relativeTo: path.join(__dirname, "static")
        }

    }
  });

  await server.register([
    {
      plugin: require("hapi-geo-locate"),
      options: {
        enabledByDefault: true,
      },
    },
    {
        plugin: require("@hapi/inert"),

    },
    {
        plugin: require("@hapi/vision"),
    }
  ]);

  server.views({
    engines: {
        html: require("handlebars")
    },
    path: path.join(__dirname, "views")
  });


  server.route([
    {
      method: "GET",
      path: "/",
      handler: (request, h) => {
        return h.file("welcome.html");
      },
    },
    {
      method: "GET",
      path: "/users",
      handler: (request, h) => {
        return "<h1>Users</h1>";
      },
    },
    {
        method: "POST",
        path: "/login",
        handler: (request, h) => {
            if(request.payload.username === "admin" && request.payload.password === "admin"){
                return h.file("logged-in.html");
            }
            return "wrong password and/or username";
        }

    },
    {
      method: "GET",
      path: "/location",
      handler: (request, h) => {
        if (request.location) {
          return request.location;
        }
        return "<h1>Location not found</h1>";
      },
    },
    {
        method: "GET",
        path: "/dynamic",
        handler: (request, h) => {
            const data = {
                name: "John Doe",
            }
            return h.view("index", data);
        }
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
