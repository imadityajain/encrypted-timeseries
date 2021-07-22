const { decrypt, convertHash } = require('./../utility/encryptionalgo');
const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGO_URL);
const dbName = process.env.MONGO_DBNAME;

async function decodePayloadAndStore(payload) {
    try {

        payload = payload.toString('utf8');
        const hashs = payload.split('|');

        for (const hash of hashs) {

            const payload = JSON.parse(decrypt(hash));
            const { name, origin, destination, secret_key } = payload;

            const message = {
                name,
                origin,
                destination
            };
            if (convertHash(JSON.stringify(message)) !== secret_key) {
                console.log('Data not matched');
                return;
            }

            if (source === destination) {
                console.log('Invalid data');
                return;
            }

            console.log(message);

            await client.connect();
            const db = client.db(dbName);
            const collection = db.collection('message');

            await collection.insertOne({ name, origin, destination, ts: new Date() });

            // In case not using timeseries collection
            // const ts = new Date();
            // await collection.updateOne({
            //     name,
            //     nsamples: { $lt: 200 }
            // },
            //     {
            //         $push: { tour: { origin, destination } },
            //         $min: { first: ts },
            //         $max: { last: ts },
            //         $inc: { nsamples: 1 }
            //     },
            //     { upsert: true });
        }
    } catch (error) {
        console.error(error);
    } finally {
        client.close()
    }

}
module.exports = decodePayloadAndStore;