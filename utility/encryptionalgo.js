const crypto = require('crypto');

const algorithm = 'aes-256-ctr';
const secretKey = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3';
const iv = crypto.randomBytes(16);

function encrypt(text) {
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};
exports.encrypt = encrypt;

function decrypt(hash) {

    let textParts = hash.split(':');
    let iv = Buffer.from(textParts.shift(), 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    
    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
    const decrpyted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);

    return decrpyted.toString();
};
exports.decrypt = decrypt;

function convertHash(string) {
    return crypto.createHash('sha256').update(string).digest('hex');
}
exports.convertHash = convertHash;