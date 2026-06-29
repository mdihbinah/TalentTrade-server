const dns = require('node:dns')
dns.setServers(['8.8.8.8', '8.8.4.4'])

const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


dotenv.config()
const app = express()
app.use(express.json())
app.use(cors())

const PORT = process.env.PORT
const uri = process.env.MONGODB_URL

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const clientVerify = async (req, res, next) => {
  const user = req.user;
  if (user.role !== "client") {
    return res.status(403).json({ msg: "Forbidden" });
  }
  next();
};





async function run() {
  try {
    const db = client.db('TalentTrade')
    const taskCollection = db.collection('tasks')
    const userCollection = db.collection('user')
    const paymentCollection = db.collection('payments')
    const proposalsCollection = db.collection('proposals')

    // app.get('/api/tasks', async (req, res) => {
    //   const result = await taskCollection.find().toArray()
    //   res.json(result)
    // })
    app.get('/api/my-tasks', async (req, res) => {
      const { id } = req.body
      const result = await taskCollection.find({ client_id: new ObjectId(id) }).toArray()
      res.json(result)
    })

    app.get("/api/tasks/latest", async (req, res) => {
      const latestTasks = await taskCollection
        .find()
        .sort({ createdAt: -1 })
        .limit(6)
        .toArray();

      res.send(latestTasks);
    });


    app.get('/proposals', clientVerify, async (req, res) => {
      const result = await proposalsCollection.find().toArray()
      res.json(result)
    })

    app.get('/api/users', async (req, res) => {
      const result = await userCollection.find().toArray()
      res.json(result)
    })

    app.get('/api/payments', async (req, res) => {
      const result = await paymentCollection.find().toArray()
      res.json(result)
    })

    app.get('/api/freelancers', async (req, res) => {
      const result = await userCollection.find({ role: 'Freelancer' }).toArray()
      res.json(result)
    })

    app.get("/api/freelancers/top", async (req, res) => {
      const freelancers = await userCollection
        .find({
          role: "Freelancer",
          isBlocked: false,
        })
        .sort({
          totalFinishedJobs: -1,
        })
        .limit(6)
        .toArray();
      res.send(freelancers);
    });

    app.get('/api/freelancer/:id', async (req, res) => {
      const { id } = req.params
      const result = await userCollection.findOne({ _id: new ObjectId(id) })
      res.json(result)
    })
    app.get('/api/task/:id', async (req, res) => {
      const { id } = req.params
      const result = await taskCollection.findOne({ _id: new ObjectId(id) })
      res.json(result)
    })
    app.get('/api/tasks', async (req, res) => {
      // const { search, type } = req.query;
      const search = req.query.search || "";
      const category = req.query.category || "all";
      console.log(search, category)

      let filter = {};

      if (search) {
        filter.title = {
          $regex: search,
          $options: 'i'
        };
      }

      if (category !== "all") {
      filter.category = {
        $in: [category],
      };
    }

      // if (type) {
      //   filter.category = {
      //     $regex: type,
      //     $options: 'i'
      //   };
      // }

      const result = await taskCollection.find(filter).toArray();
      res.status(200).json(result);
    });


    app.delete('/api/task/:id', async (req, res) => {
      const { id } = req.params
      const result = await taskCollection.deleteOne({ _id: new ObjectId(id) })
      res.json(result)
    })

    app.post(`/tasks`, async (req, res) => {
      const body = req.body
      console.log(body)
      const result = await taskCollection.insertOne(body)
      res.json(result)
    })

    app.post(`/proposals`, async (req, res) => {
      const body = req.body
      console.log(body)
      const result = await proposalsCollection.insertOne(body)
      res.json(result)
    })

    app.patch('/api/user/:id', async (req, res) => {
      const { id } = req.params;

      // console.log(req.body)

      const result = await userCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: { isBlocked: req.body.isBlocked },
        }
      );
      res.json(result);
    });

    app.patch('/api/freelancer/:id', async (req, res) => {
      const { id } = req.params;

      const result = await userCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: req.body,
        }
      );
      res.json(result);
    });




    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Server is running.........')
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})