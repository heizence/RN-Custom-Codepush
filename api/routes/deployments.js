const express = require("express");
const router = express.Router();
const { getDeploymentHistory } = require("../database/query");
const { responseDto } = require("../DTO/response");

router.get("/history", async (req, res) => {
  console.log(`\n[router]/deployment/history`);

  try {
    const tokenInfo = req.tokenInfo;
    const { appName, deploymentName } = req.query;

    const queryRes = await getDeploymentHistory(tokenInfo.accountId, appName, deploymentName);
    console.log("queryRes : ", queryRes);
    if (!queryRes) {
      res.status(501).json(responseDto(false, "Get deployment histroy failed. Internal error!"));
    } else {
      res.status(queryRes.statusCode).json(queryRes);
    }
  } catch (err) {
    res.status(501).json(responseDto(false, "Get deployment histroy failed. Internal error!", err));
  }
});

module.exports = router;
