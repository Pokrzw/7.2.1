const express = require("express");
const dbo = require("../db/conn");
const ObjectId = require("mongodb").ObjectId;

const app = express.Router();

app.get("/products", async (req, res) => {
  const sort_by = req.query.sort;
  const db = await dbo.getDb("mongo");
  db.collection("products")
    .find({})
    .toArray((err, result) => {
      if (err) throw err;
      if (!sort_by) {
        return res.send(result);
      }
      const sorted_result = result.sort((a, b) => a[sort_by] - b[sort_by]);
      return res.send(sorted_result);
    });
});

app.post("/products", async (req, res) => {
  const { name, price, description, amount, unit } = req.body;
  const productToAdd = {
    name,
    price,
    description,
    amount,
    unit,
  };

  const db = await dbo.getDb("mongo");
  db.collection("products").findOne({ name }, function (err, product) {
    if (product) return res.send("Produkt istnieje");

    db.collection("products").insertOne(productToAdd, async (err, result) => {
      if (err) throw err;
      res.send(result);
    });
  });
});

app.put("/products/:id", async (req, res) => {
  const { id, name, price, description, amount, unit } = req.body;
  const db = await dbo.getDb("mongo");
  const product_id = { _id: ObjectId(id) };

  db.collection("products").updateOne(
    product_id,
    {
      $set: {
        name,
        price,
        description,
        amount,
        unit,
      },
    },
    (err, result) => {
      if (err) throw err;
      res.send(result);
    }
  );
});

app.delete("/products/:id", async (req, res) => {
  const { id } = req.body;
  const db = await dbo.getDb("mongo");
  const product_id = { _id: ObjectId(id) };
  db.collection("products").deleteOne(product_id, (err, result) => {
    if (err) console.log(err);
    res.send(result);
  });
});

app.get("/products/raport", async (req, res) => {
  const db = await dbo.getDb("mongo");

  const aIndex = db.collection("products").aggregate([
    { $match: {} },
    {
      $group: {
        _id: "$name",
        totalOrderValue: { $sum: { $multiply: ["$price", "$qty"] } },
      },
    },
  ]);
  
  let result = [];
  for await (const doc of aIndex) {
    result.push(doc);
  }
  res.send(result);
});

module.exports = app;