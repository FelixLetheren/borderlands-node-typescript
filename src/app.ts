import express from 'express';
import {MongoClient} from 'mongodb'
import cors from 'cors'


const app = express()
const port = 3000

app.listen(port, () => console.log(`Borderlands API listening on ${port}`))
app.use(cors())

const mongoUrl = 'mongodb://localhost:27017/'
const dbName = 'borderlands'

var getDataFromDb = (db, callback) => {
    var collection = db.collection('player-builds')
    collection.find({ title: { $exists: true } }).toArray(function (err, docs) {
        callback(docs)
    })
}

app.get('/builds', (req, res) => {
    MongoClient.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(client => {
            let db = client.db(dbName)
            let collection = db.collection('player-builds')
            collection.find({}).toArray()
                .then((docs) => {
                    if (docs.length === 0) {
                        return composeResponseJson(res, 500, false, 'Data not found', docs)
                    }
                    return composeResponseJson(res, 200, true, 'success', docs)
                })
                .catch(err => {
                    console.log(err)
                    return composeResponseJson(res, 500, false, 'Error getting data from database.', [])
                })
                .finally(() => {
                    client.close()
                })
        }).catch(err => {
            console.log(err)
            return composeResponseJson(res, 500, false, 'Server error.', [])
        })
})

app.get('/builds/:title', (req, res) => {
    let requestID = req.params.title
    console.log(requestID)
    MongoClient.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(client => {
            let db = client.db(dbName)
            let collection = db.collection('player-builds')
            collection.findOne({ title: requestID })
                .then((docs) => {
                    if (docs.length === 0) {
                        return composeResponseJson(res, 500, false, 'Data not found', docs)
                    }
                    return composeResponseJson(res, 200, true, 'success', docs)
                })
                .catch(err => {
                    console.log(err)
                    return composeResponseJson(res, 500, false, 'Error getting data from database.', [])
                })
                .finally(() => {
                    client.close()
                })
        }).catch(err => {
            console.log(err)
            return composeResponseJson(res, 500, false, 'Server error.', [])
        })
})


const composeResponseJson = function (res, status, success, message, data) {
    return res.status(status).json({
        success: success,
        message: message,
        data: data
    })
}
