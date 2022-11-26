/** @format */

const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
var jwt = require("jsonwebtoken");
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
    const laptopBookingCollection = client
      .db("retailerMania")
      .collection("laptopBookings");

    //users collection
    const usersCollection = client.db("retailerMania").collection("users");

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
      const cursor = dellCollection.find(query);
      const items = await cursor.toArray();
      res.send(items);
    });

    //get user specific data into database
    app.get("/bookings", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const bookings = laptopBookingCollection.find(query);
      const result = await bookings.toArray();
      res.send(result);
    });

    // inserting laptop booking data
    app.post("/bookings", async (req, res) => {
      const bookings = req.body;
      const result = await laptopBookingCollection.insertOne(bookings);
      res.send(result);
    });

    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);

      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "1h",
        });
        return res.send({ accessToken: token });
      }
      console.log(user);
      res.status(403).send({ accessToken: "" });
    });

    //user data save into database
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
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
