const express = require('express');
const {MongoClient, ObjectId} = require('mongodb');

const app = express();
const port = 8000;

app.use(express.json());
app.use(express.static('public')); 

async function getDbCollection(dbAddress, dbName,dbCollectionName) {
	const client = new MongoClient(dbAddress);
    await client.connect();
    const db = client.db(dbName);
    return db.collection(dbCollectionName);
}



app.get('/swords', async function(req, res) {
    const collection = await getDbCollection('mongodb://127.0.0.1', 'swordinventory', 'swords'); 
    const data = await collection.find({}).toArray();
    res.send(data);
});


app.get('/swords/:id', async function(req, res) {
    const collection = await getDbCollection('mongodb://127.0.0.1', 'swordinventory', 'swords'); 
    const data = await collection.findOne({_id: new ObjectId(req.params.id)});
    res.send(data);
});


app.post('/swords', async function(req, res) {
	const sword = {...req.body, available: true} 
    const collection = await getDbCollection('mongodb://127.0.0.1', 'swordinventory', 'swords'); 
    await collection.insertOne(sword);
    res.send(sword);
});

app.patch('/swords/:id', async function(req, res){
    const collection = await getDbCollection('mongodb://127.0.0.1', 'swordinventory', 'swords'); 
    const swordId = req.params.id; 
    const updateData = req.body;

    try {
        const result = await collection.updateOne(
            { _id: new ObjectId(swordId) }, 
            { '$set': updateData }
        );
        if (result.matchedCount === 1) {
            res.status(200).send({});
        } else {
            res.status(404).send({ message: 'Sword not found' }); 
        }
    } catch (error) {
        res.status(500).send({ message: 'Internal server error' });
    }
});


app.delete('/swords/:id', async function(req, res) {
    const collection = await getDbCollection('mongodb://127.0.0.1', 'swordinventory', 'swords'); 
    await collection.deleteOne({_id: new ObjectId(req.params.id)});
    res.send({});
});

app.listen(port, function() {
    console.log('Server for Sword Inventory is started on port ' + port + '!'); 
});