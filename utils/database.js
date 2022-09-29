const mongoose = require("mongoose");
require("dotenv").config();

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch(err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDb;