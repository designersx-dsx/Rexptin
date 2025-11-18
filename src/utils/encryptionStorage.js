import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.REACT_APP_CRYPTO_KEY; // .env me rakhna

export  function encryptData(data) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
}

export  function decryptData(cipherText) {
  const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}