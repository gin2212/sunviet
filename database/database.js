var mongoose = require("mongoose");
class Database {
  constructor() {
    this._connect();
  }
  _connect() {
    let mongodbURL = process.env.MONGODB_URL;
    mongoose
      .connect(mongodbURL)
      .then(() => {
        console.log("Database connection successful");
      })
      .catch((err) => {
        console.error("Database connection error");
      });
  }
}

module.exports = new Database();
