const dotenv = require("dotenv");
const { verifyToken } = require("../services/jwt-utils");
const { responseDto } = require("../DTO/response");
const { findUser } = require("../database/query");
dotenv.config();

// Token verification middleware
const CheckTokenMiddleware = async (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    console.log("no token!");
    responseDto;
    return res.status(401).json(responseDto(false, "No token provided"));
  }

  // Verify the token using your secret key
  const tokenInfo = verifyToken(token);
  //console.log("tokenInfo : ", tokenInfo);
  if (tokenInfo) {
    req.tokenInfo = tokenInfo;

    const accountId = tokenInfo.accountId;
    const checkUser = await findUser(accountId);

    if (checkUser.length > 0) {
      console.log("[CheckTokenMiddleWare]token is valid!");
      const userId = checkUser[0].id;
      req.userId = userId;
      next();
      return;
    }
  }
  console.log("[CheckTokenMiddleWare]token is invalid!");
  return res.status(403).json(responseDto(false, "Invalid token. Please login again."));
};

module.exports = CheckTokenMiddleware;
