const path = require("path");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const generateJWT = accountId => {
  const uniqueId = uuidv4();
  const token = jwt.sign(
    {
      accountId,
      uniqueId,
    },
    process.env.JWT_SECRET, // Secret key stored in .env
    { expiresIn: "7d" } // Token valid for 7 days
  );
  return token;
};

const verifyToken = token => {
  try {
    if (!token) {
      return false;
    }
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    //console.log("verified : ", verified);
    return verified;
  } catch (err) {
    //console.log("verification error : ", err);
    return false;
  }
};

module.exports = {
  generateJWT,
  verifyToken,
};
