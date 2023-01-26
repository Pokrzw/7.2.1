const { MongoClient } = require("mongodb");
const url = "mongodb://localhost:27017/mongo";
const client = new MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const express = require("express");
const app = express();

var _db;

module.exports = {
  connectToServer: function (callback) {
    client.connect(function (err, db) {
      if (db) {
        _db = db.db("test_example");
        console.log("Successfully connected to MongoDB");
      }
      return callback(err);
    });
  },
  getDb: function () {
    return _db;
  },
};


app.use(express.json());
app.use(require("./routes/products"));

const db = require("./db/conn");

app.listen(5000, () => {
  db.connectToServer(function (err) {
    if (err) console.error(err);
  });
  console.log("API dziala na porcie 5000");
});