/** @format */

const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();

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

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send('unauthorized access');
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'forbidden access' });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    //create collections
    const retailerCollection = client
      .db('retailerMania')
      .collection('categories');
    const dellCollection = client.db('retailerMania').collection('dell');
    const laptopBookingCollection = client
      .db('retailerMania')
      .collection('laptopBookings');

    //users collection
    const usersCollection = client.db('retailerMania').collection('users');
    const sellersCollection = client.db('retailerMania').collection('sellers');

    //categories showing
    app.get('/category', async (req, res) => {
      const cursor = retailerCollection.find({});
      const category = await cursor.toArray();
      res.send(category);
    });

    //filtering the category id and get specific category items
    app.get('/category/:id', async (req, res) => {
      let id = req.params.id;
      let query = { categoryid: id };
      const cursor = dellCollection.find(query);
      const items = await cursor.toArray();
      res.send(items);
    });

    //add product category route
    app.get('/categoryadd', async (req, res) => {
      const query = {};
      const result = await retailerCollection
        .find(query)
        .project({ title: 1 })
        .toArray();
      res.send(result);
    });

    //get user specific data into database
    app.get('/bookings', verifyJWT, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      // console.log("token", req.headers.authorization);
      if (email !== decodedEmail) {
        return res.status(403).send({ message: 'forbidden access' });
      }
      const query = { email: email };

      const bookings = laptopBookingCollection.find(query);
      const result = await bookings.toArray();
      res.send(result);
    });

    // inserting laptop booking data
    app.post('/bookings', async (req, res) => {
      const bookings = req.body;
      const result = await laptopBookingCollection.insertOne(bookings);
      res.send(result);
    });

    app.get('/jwt', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);

      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: '1h',
        });
        return res.send({ accessToken: token });
      }
      console.log(user);
      res.status(403).send({ accessToken: '' });
    });

    //get all the users
    app.get('/users', async (req, res) => {
      const query = {};
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    });

    app.get('/users/admin/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === 'admin' });
    });

    //user data save into database
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    //
    app.put('/users/admin/:id', verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const query = { email: decodedEmail };
      const user = await usersCollection.findOne(query);

      if (user?.role !== 'admin') {
        return res.status(403).send({ message: 'forbidden access' });
      }

      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          role: 'admin',
        },
      };

      const result = await usersCollection.updateOne(
        filter,
        updatedDoc,
        options
      );

      res.send(result);
    });

    app.get('/sellers', async (req, res) => {
      const query = {};
      const sellers = await sellersCollection.find(query).toArray();
      res.send(sellers);
    });

    app.post('/sellers', async (req, res) => {
      const seller = req.body;
      const result = await sellersCollection.insertOne(seller);
      res.send(result);
    });
  } finally {
  }
}

run().catch(console.log());

app.get('/', (req, res) => {
  res.send('retailer server work');
});

//category load

const port = process.env.Port || 5000;

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
