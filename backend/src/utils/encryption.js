const CryptoJS = require('crypto-js');

const SECRET = process.env.AES_SECRET;

const encrypt = (data) => {
  if (!data) return data;
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET).toString();
};

const decrypt = (ciphertext) => {
  if (!ciphertext) return ciphertext;
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

module.exports = { encrypt, decrypt };
