const express = require('express');
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const net = require('net');

// socket server to connect server side service(s)
const netServer = net.createServer((client) => {
    console.log('Emitter Connected');

    client.on('end', function () {
        console.log('Emitter disconnected');
    });

    client.on('data', function(data) {
        console.log(`Recieved: ${data}`);
    })

    client.write('hello\r\n');
});

netServer.listen(8124);

app.get('/', (req, res) => {
    res.send(`App Running....`);
});
app.use(express.static(__dirname + '/static'));

// client side socket events
io.on('connection', (socket) => {
    //socket.emit();
});
server.listen(8081);