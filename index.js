const express = require('express');
const net = require('net');
const listener = require('./controllers/listener');
const { MongoClient } = require('mongodb');

const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const url = "mongodb://localhost:27017/messageDB";
const client = new MongoClient(url)
const dbName = 'messageDB'

//make client connect 
async function initMongo() {
    try {
        // Use connect method to connect to the server
        await client.connect();
        console.log('Connected successfully to server')
        const db = client.db(dbName)

        const collections = await client.db().listCollections().toArray();
        const collectionNames = collections.map(c => c.name).filter(n => n === "message");

        if(collectionNames.length > 0) {
            console.log('Found Collection');
            return;
        }

        await db.createCollection("message", {
            timeseries: {
                timeField: "ts",
                granularity: "minutes",
            }
        });
        // the following code examples can be pasted here...
        console.log('Create collection');
        client.close()
    } catch (error) {
        console.error(error);
    } finally {
        client.close()
    }
}
initMongo();

// socket server to connect server side service(s)
const netServer = net.createServer((client) => {
    console.log('Emitter Connected');

    client.on('end', function () {
        console.log('Emitter disconnected');
    });

    client.on('data', function (data) {
        listener(data);
    })

    client.write('hello\r\n');
});

netServer.listen(8124);

app.get('/', (req, res) => {
    res.send(`App Running....`);
});
app.use(express.static(__dirname + '/public'));

// client side socket events
io.on('connection', (socket) => {
    //socket.emit();
});
server.listen(8081);