const path = require("path");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const generateJWT = (accountId, type, name) => {
  return jwt.sign(
    {
      accountId,
      type,
      name,
    },
    process.env.JWT_SECRET, // Secret key stored in .env
    { expiresIn: "365d" } // Token valid for 365 days
  );
};

const verifyToken = token => {
  if (!token) {
    return res.status(401).send("Access Denied: No token provided");
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET); // Verify token using the secret key
  } catch (err) {
    res.status(400).send("Invalid Token");
  }
};

module.exports = {
  generateJWT,
  verifyToken,
};
