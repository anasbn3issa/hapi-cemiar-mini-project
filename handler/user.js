require("dotenv").config();

const utils = require("../utils");
const Boom = require("boom");
const jsonwebtoken = require("jsonwebtoken");
const User = require("../models/user");

const userApi = {
    getAllUsers: async (request, h) => {
        const users = await User.find({});
        console.log(users);
        return users;
    },
    getUserByid: async (request, h) => {
        const user = await User.findById(request.params.id);
        if (!user) {
            return Boom.notFound("User not found");
        }
        console.log(user);
        return user;
    },
    createUser: async (request, h) => {
        const user = new User(request.payload);
        const result = await user.save();
        console.log(result);
        return h.response(result).code(201);
    }
}


module.exports = userApi;