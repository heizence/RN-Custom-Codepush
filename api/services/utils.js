const crypto = require("crypto");

const isValidName = someName => {
  const invalidNameRegex = /[<>:"/\\|?*\x00-\x1F]/;
  return !invalidNameRegex.test(someName);
};

const generateRandomkey = (length = 30) => {
  const randomBytes = crypto.randomBytes(length);
  const randomKey = randomBytes.toString("base64").replace(/=/g, "").slice(0, length);
  return randomKey;
};

module.exports = {
  isValidName,
  generateRandomkey,
};
