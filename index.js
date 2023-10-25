const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4ataypz.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();j

    const productCollection = client.db("brandShopDB").collection("product");
    const brandCollection = client.db("brandShopDB").collection("brand");
    const cartCollection = client.db("brandShopDB").collection("cart");

    // for get brands data
    app.get("/brands", async (req, res) => {
      const cursor = brandCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // for  product collection

    app.get("/products", async (req, res) => {
      const brand_name = req.query.brand_name;

      if (!brand_name) {
        return res
          .status(400)
          .json({ error: "brand_name parameter is required" });
      }

      const filter = { brand_name };

      try {
        const cursor = productCollection.find(filter);
        const result = await cursor.toArray();
        res.json(result);
      } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });

    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productCollection.insertOne(product);
      res.send(result);
    });

    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
      const product = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };

      const updateProduct = {
        $set: {
          image_url: product.image_url,
          product_name: product.product_name,
          brand_name: product.brand_name,
          product_price: product.product_price,
          product_rating: product.product_rating,
          category: product.category,
          short_description: product.short_description,
        },
      };
      const result = await productCollection.updateOne(
        filter,
        updateProduct,
        options
      );
      res.send(result);
    });

    // for cart collection

    app.get("/cart", async (req, res) => {
      const cursor = cartCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/cart", async (req, res) => {
      const product = req.body;
      const result = await cartCollection.insertOne(product);
      res.send(result);
    });

    app.delete("/cart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: id };

      const result = await cartCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("My Server is Working....");
});

app.listen(port, () => {
  console.log(`My Server Is Opening On Port:${port}`);
});
