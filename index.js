/** @format */

const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();

//middile ware

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ap4ff9h.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    //create collections
    const retailerCollection = client
      .db("retailerMania")
      .collection("categories");
    const dellCollection = client.db("retailerMania").collection("dell");

    //categories showing
    app.get("/category", async (req, res) => {
      const cursor = retailerCollection.find({});
      const category = await cursor.toArray();
      res.send(category);
    });

    //filtering the category id and get specific category items
    app.get("/category/:id", async (req, res) => {
      let id = req.params.id;
      let query = { categoryid: id };
      // if (id) {
      //   query = {
      //     categoryid: id,
      //   };
      // }
      const cursor = dellCollection.find(query);
      const items = await cursor.toArray();
      res.send(items);
    });
  } finally {
  }
}

run().catch(console.log());

app.get("/", (req, res) => {
  res.send("retailer server work");
});

//category load

const port = process.env.Port || 5000;

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
