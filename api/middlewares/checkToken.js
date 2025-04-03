const dotenv = require("dotenv");
const { verifyToken } = require("../services/jwt-utils");
const { responseDto } = require("../DTO/response");
dotenv.config();

// Token verification middleware
const CheckTokenMiddleware = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    console.log("no token!");
    responseDto;
    return res.status(401).json(responseDto(false, "No token provided"));
  }

  // Verify the token using your secret key
  const tokenInfo = verifyToken(token);
  console.log("tokenInfo : ", tokenInfo);
  if (tokenInfo) {
    console.log("[CheckTokenMiddleWare]token is valid!");
    req.tokenInfo = tokenInfo;
    next();
  } else {
    console.log("[CheckTokenMiddleWare]token is invalid!");
    return res.status(403).json(responseDto(false, "Invalid token"));
  }
};

module.exports = CheckTokenMiddleware;
