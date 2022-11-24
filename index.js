/** @format */

const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();

//middile ware

app.use(cors());
app.use(express.json());

const uri =
  'mongodb+srv://retailer:d5HFqRVXPS0zdE0G@cluster0.ap4ff9h.mongodb.net/?retryWrites=true&w=majority';

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    //create collections
    const retailerCollection = client
      .db('retailerMania')
      .collection('categories');

    //category loading
    app.get('/category', async (req, res) => {
      const cursor = retailerCollection.find({});
      const category = await cursor.toArray();
      res.send(category);
    });
  } finally {
  }
}

run().catch(console.log());

app.get('/', (req, res) => {
  res.send('retailer server work');
});

// DB_user = retailer;
// DB_password = d5HFqRVXPS0zdE0G;

//category load

const port = process.env.Port || 5000;

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
