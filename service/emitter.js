const net = require('net');

const client = new net.Socket();
client.connect(8124, '127.0.0.1', () => {
    
    console.log('Emitter Connected!');

    setInterval(() => {
        client.write('Send data to Listener. . .');
    }, 1000);
});

client.on('close', function () {
    console.log('Connection closed');
});