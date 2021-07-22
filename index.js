require('dotenv').config({ path: './config/.env' });

const express = require('express');
const net = require('net');
const { MongoClient } = require('mongodb');
const listener = require('./controllers/listener');
const logger = require('./log/logger');

const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const url = process.env.MONGO_URL;
const client = new MongoClient(url)
const dbName = process.env.MONGO_DBNAME;

//make client connect 
async function initMongo() {
    try {
        // Use connect method to connect to the server
        await client.connect();
        console.log('Connected successfully to server')
        const db = client.db(dbName)

        const collections = await client.db().listCollections().toArray();
        const collectionNames = collections.map(c => c.name).filter(n => n === "message");

        if (collectionNames.length > 0) {
            console.log('Found Collection');
            return;
        }

        await db.createCollection("message", {
            timeseries: {
                timeField: "ts",
                metaField: "name",
                granularity: "seconds",
            }
        });
        // the following code examples can be pasted here...
        console.log('Create collection');
    } catch (error) {
        logger.error(error);
        process.exit(1);
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

    client.on('data', async function (data) {
        try {
            let response = await listener(data);
            emitMessage(response);
        } catch (error) {
            logger.error(error);
        }
    })
});

netServer.listen(process.env.SOCKET_PORT);

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`);
});

app.use(express.static(__dirname + '/public'));

// client side socket events
io.on('connection', function (socket) {
    socket.emit('data', { message: 'Starting Process' });
});

function emitMessage(data) {
    io.sockets.volatile.emit('data', data);
}

server.listen(process.env.PORT);