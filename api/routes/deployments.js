const express = require("express");
const router = express.Router();
const { addDeployment, removeDeployment, renameDeployment, getDeploymentList, getDeploymentHistory, clearDeployment } = require("../database/query");
const { responseDto } = require("../DTO/response");

router.post("/add", async (req, res) => {
  console.log(`\n[router]/deployment/add`);

  try {
    const tokenInfo = req.tokenInfo;
    const { appName, deploymentName } = req.body;

    const queryRes = await addDeployment(tokenInfo.accountId, appName, deploymentName);

    if (!queryRes) {
      res.status(501).json(responseDto(false, "add deployment failed. Internal error!"));
    } else {
      res.status(queryRes.statusCode).json(queryRes);
    }
  } catch (err) {
    res.status(501).json(responseDto(false, "add deployment failed. Internal error!", err));
  }
});

router.post("/clear", async (req, res) => {
  console.log(`\n[router]/deployment/clear`);

  try {
    const tokenInfo = req.tokenInfo;
    const { appName, deploymentName } = req.body;

    const queryRes = await clearDeployment(tokenInfo.accountId, appName, deploymentName);

    if (!queryRes) {
      res.status(501).json(responseDto(false, "Get deployment list failed. Internal error!"));
    } else {
      res.status(queryRes.statusCode).json(queryRes);
    }
  } catch (err) {
    res.status(501).json(responseDto(false, "Get deployment list failed. Internal error!", err));
  }
});

router.post("/remove", async (req, res) => {
  console.log(`\n[router]/deployment/remove`);

  try {
    const tokenInfo = req.tokenInfo;
    const { appName, deploymentName } = req.body;

    const queryRes = await removeDeployment(tokenInfo.accountId, appName, deploymentName);

    if (!queryRes) {
      res.status(501).json(responseDto(false, "Remove deployment failed. Internal error!"));
    } else {
      res.status(queryRes.statusCode).json(queryRes);
    }
  } catch (err) {
    res.status(501).json(responseDto(false, "Remove deployment failed. Internal error!", err));
  }
});

router.post("/rename", async (req, res) => {
  console.log(`\n[router]/deployment/rename`);

  try {
    const tokenInfo = req.tokenInfo;
    const { appName, currentDeploymentName, newDeploymentName } = req.body;

    const queryRes = await renameDeployment(tokenInfo.accountId, appName, currentDeploymentName, newDeploymentName);

    if (!queryRes) {
      res.status(501).json(responseDto(false, "Get deployment list failed. Internal error!"));
    } else {
      res.status(queryRes.statusCode).json(queryRes);
    }
  } catch (err) {
    res.status(501).json(responseDto(false, "Get deployment list failed. Internal error!", err));
  }
});

router.get("/list", async (req, res) => {
  console.log(`\n[router]/deployment/list`);

  try {
    const tokenInfo = req.tokenInfo;
    const { appName } = req.query;

    const queryRes = await getDeploymentList(tokenInfo.accountId, appName);

    if (!queryRes) {
      res.status(501).json(responseDto(false, "Get deployment list failed. Internal error!"));
    } else {
      res.status(queryRes.statusCode).json(queryRes);
    }
  } catch (err) {
    res.status(501).json(responseDto(false, "Get deployment list failed. Internal error!", err));
  }
});

router.get("/history", async (req, res) => {
  console.log(`\n[router]/deployment/history`);

  try {
    const tokenInfo = req.tokenInfo;
    const { appName, deploymentName } = req.query;

    const queryRes = await getDeploymentHistory(tokenInfo.accountId, appName, deploymentName);

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
