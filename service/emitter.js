const net = require('net');
const { encrypt, convertHash } = require('./../utility/encryptionalgo');
const data = require('./../static/data.json');

const client = new net.Socket();

function getRandomElementFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function generateMessage() {
    const message = {
        name: getRandomElementFromArray(data.names),
        origin: getRandomElementFromArray(data.cities),
        destination: getRandomElementFromArray(data.cities)
    };

    const checkSumMessage = { ...message, secret_key: convertHash(JSON.stringify(message)) };
    return encrypt(JSON.stringify(checkSumMessage));
}

function generatePayload() {
    let i = -1;
    const payloadTotalItem = 10;
    let messages = [];

    while (++i !== payloadTotalItem) {
        messages.push(generateMessage());
    }
    
    return messages.join('|');
}

client.connect(8124, '127.0.0.1', () => {

    console.log('Emitter Connected!');

    setInterval(() => {
        const payload = generatePayload();
        client.write(payload);
    }, 10000);
});

client.on('close', function () {
    console.log('Connection closed');
});