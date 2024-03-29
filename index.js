const express = require("express");
const cors = require("cors");
const app = express();
require('dotenv').config()
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5001;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors({
  origin: [
    
    'https://b8a11-client-side-a777d.web.app',
    'https://b8a11-client-side-a777d.firebaseapp.com'
  ],
  credentials: true
}));
app.use(express.json());







const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.awuevue.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const logger = (req, res, next) => {
  console.log('log: info', req.method, req.url);
  next();
}

const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
  console.log('token in the middleware', token);
 
  if (!token) {
    return res.status(401).send({ message: 'unauthorized access' })
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'unauthorized access' })
    }
    req.user = decoded;
    next();
  })
}

async function run() {
  try {
   
    await client.connect();
    const addjobCollection = client.db('JobsDB').collection('jobs');
    const mybidsCollection = client.db('JobsDB').collection('mybids');
    


    app.post('/jwt', async (req, res) => {
      const user = req.body;
      console.log('user for token', user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
      })
        .send({ success: true });
    })

    app.post('/logout', async (req, res) => {
      const user = req.body;
      console.log('logging out', user);
      res.clearCookie('token', { maxAge: 0 }).send({ success: true })
    })

    app.post('/jobs', async (req, res) => {
      const newJob = req.body;
      console.log(newJob);
      const result = await addjobCollection.insertOne(newJob);
      res.send(result);
      console.log("This is the post   Api");
    })

    //post api for mybids
    app.post('/mybids', async (req, res) => {
      const newJob = req.body;
      console.log(newJob);
      const result = await mybidsCollection.insertOne(newJob);
      res.send(result);
      console.log("This is the post   Api for my bids");
    })

    app.get('/mybids', async (req, res) => {
      const cursor = mybidsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })


    app.put('/jobs/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: id }
      const options = { upsert: true };
      const updatedjobs = req.body;
      console.log("This is the put  Api");

      //const { _id,email, jobTitle, description, category, minPrice, maxPrice } = job || {};

      const jobs = {
        $set: {
          email: updatedjobs.email,
          jobTitle: updatedjobs.jobTitle,
          description: updatedjobs.description,
          category: updatedjobs.category,
          minPrice: updatedjobs.minPrice,
          maxPrice: updatedjobs.maxPrice
        }
      }

      const result = await addjobCollection.updateOne(filter, jobs, options);
      res.send(result);
      console.log("tafsir");
    })

    app.delete('/jobs/:id', async (req, res) => {
      const id = req.params.id;
      console.log("deleted id", id);
      const query = { _id: new ObjectId(id) }
      const result = await addjobCollection.deleteOne(query);


      res.send(result);

    })

    app.get('/jobs/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await addjobCollection.findOne(query);
      res.send(result);
      console.log("This is the single item finding   Api");
    })

    app.get('/jobs', async (req, res) => {
      const cursor = addjobCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })



    app.get('/jobs/:email', async (req, res) => {
      console.log(req.query.email);
      const result = await addjobCollection.find().toArray();
      res.send(result);

    })

   
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
  res.send("Assinment 11 server is Running. Running..");
});


app.listen(port, () => {
  console.log(`Assinment 11 is Running on port ${port}`);
});