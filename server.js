"use strict";

require("dotenv").config();

const Hapi = require("@hapi/hapi");
const path = require("path");
const mongoose = require("mongoose");
const axios = require("axios");


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
      path: "/auth",
      handler: (request, h) => {
        return h.redirect(
          `https://github.com/login/oauth/authorize?client_id=${process.env.OAUTH_GITHUB_CLIENT_ID}`);
      }
    },
    {
      method: "GET",
      path: "/auth/callback",
      handler: (request, h) => {
        const body ={
          client_id: process.env.OAUTH_GITHUB_CLIENT_ID,
          client_secret: process.env.OAUTH_GITHUB_CLIENT_SECRET,
          code: request.query.code,
        };
        const opts = {
          headers: { accept: "application/json" },
        };
        return axios.post("https://github.com/login/oauth/access_token", body, opts)
          .then((res) => {
            const accessToken = res.data.access_token;
            return h.redirect(`/auth/success?access_token=${accessToken}`);
          })
          .catch((err) => {
            console.log(err);
            return h.redirect("/auth/failure");
          });
      }
    },
    {
      //this route returns my github username
      method: "GET",
      path: "/git/username",
      handler: (request, h) => {
        const opts = {
          //headers: { Authorization: `token ${request.query.access_token}` }, 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
          headers: { Authorization: `token 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` }
        };
        return axios.get("https://api.github.com/user", opts)
          .then((res) => {
            console.log(res.data);
            return res.data.login;
          })
          .catch((err) => {
            console.log(err);
            return h.redirect("/auth/failure");
          });
      }
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
