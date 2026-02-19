const mongoose = require("mongoose");
require("dotenv").config();

const dburi = process.env.DB_URL;
// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(dburi);
    console.log("mongodb connected")
  } catch (err) {
    console.log(err, 'MongoDB connection failed!');
    process.exit(1);
  }
}
module.exports = connectDB;

