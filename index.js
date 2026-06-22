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


async function run() {
  try {
        const db = client.db('TalentTrade')
        const taskCollection = db.collection('tasks')
        const userCollection = db.collection('user')

        app.get('/api/tasks', async(req, res) => {
            const result = await taskCollection.find().toArray()
            res.json(result)
        })

        app.get('/api/freelancers', async(req, res) => {            
            const result = await userCollection.find({role: 'Freelancer'}).toArray()
            res.json(result)
        })

        app.get('/api/freelancer/:id', async(req, res) => {
            const {id} = req.params
            const result = await userCollection.findOne({_id: new ObjectId(id)})
            res.json(result)
        })
        
        app.post(`/tasks`, async(req, res) => {
            const body = req.body
            console.log(body)
            const result = await taskCollection.insertOne(body)
            res.json(result)
        })




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