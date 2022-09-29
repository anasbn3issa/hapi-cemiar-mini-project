"use strict";

require("dotenv").config();

const Hapi = require("@hapi/hapi");
const path = require("path");
const mongoose = require("mongoose");


const userApi = require("./handler/user");

//dotenv

const connectDb = require("./utils/database");



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

  connectDb();

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
    },
    {
        plugin: require("hapi-mongodb"),
        options: {
            url: process.env.MONGODB_URL ,
            settings: {
                useUnifiedTopology: true,
            },
            decorate: true,
        }
    }
  ]);

  
  server.views({
    engines: {
        hbs: require("handlebars")
    },
    path: path.join(__dirname, "views"),
    layout:'default',
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
      handler: userApi.getAllUsers,
    },
    {
        method: "GET",
        path: "/users/{id}",
        handler: userApi.getUserByid,
    },
    {
        method: "POST",
        path: "/users",
        handler: userApi.createUser,
    },
    {
        method: "POST",
        path: "/login",
        handler: (request, h) => {
            if(request.payload.username === "admin" && request.payload.password === "admin"){
                return h.view('index', {username: request.payload.username});
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
