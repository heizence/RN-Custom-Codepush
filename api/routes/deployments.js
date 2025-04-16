const express = require("express");
const router = express.Router();
const { addDeployment, removeDeployment, renameDeployment, getDeploymentList, getDeploymentHistory, clearDeployment } = require("../database/query");
const { responseDto } = require("../DTO/response");

router.get("/list", async (req, res, next) => {
  console.log(`\n[router]/deployment/list`);

  try {
    const userId = req.userId;
    const { appName } = req.query;

    const queryRes = await getDeploymentList(userId, appName);

    if (!queryRes) {
      res.status(501).json(responseDto(false, "Get deployment list failed. Internal error!"));
    } else {
      res.status(200).json(queryRes);
    }
  } catch (err) {
    next(err);
  }
});

router.post("/add", async (req, res, next) => {
  console.log(`\n[router]/deployment/add`);

  try {
    const userId = req.userId;
    const { appName, deploymentName } = req.body;

    const queryRes = await addDeployment(userId, appName, deploymentName);

    if (!queryRes) {
      res.status(501).json(responseDto(false, "add deployment failed. Internal error!"));
    } else {
      res.status(200).json(queryRes);
    }
  } catch (err) {
    next(err);
  }
});

router.post("/clear", async (req, res, next) => {
  console.log(`\n[router]/deployment/clear`);

  try {
    const userId = req.userId;
    const { appName, deploymentName } = req.body;

    const queryRes = await clearDeployment(userId, appName, deploymentName);

    if (!queryRes) {
      res.status(501).json(responseDto(false, "Get deployment list failed. Internal error!"));
    } else {
      res.status(200).json(queryRes);
    }
  } catch (err) {
    next(err);
  }
});

router.post("/remove", async (req, res, next) => {
  console.log(`\n[router]/deployment/remove`);

  try {
    const userId = req.userId;
    const { appName, deploymentName } = req.body;

    const queryRes = await removeDeployment(userId, appName, deploymentName);

    if (!queryRes) {
      res.status(501).json(responseDto(false, "Remove deployment failed. Internal error!"));
    } else {
      res.status(200).json(queryRes);
    }
  } catch (err) {
    next(err);
  }
});

router.post("/rename", async (req, res, next) => {
  console.log(`\n[router]/deployment/rename`);

  try {
    const userId = req.userId;
    const { appName, currentDeploymentName, newDeploymentName } = req.body;

    const queryRes = await renameDeployment(userId, appName, currentDeploymentName, newDeploymentName);

    if (!queryRes) {
      res.status(501).json(responseDto(false, "Get deployment list failed. Internal error!"));
    } else {
      res.status(200).json(queryRes);
    }
  } catch (err) {
    next(err);
  }
});

router.get("/history", async (req, res, next) => {
  console.log(`\n[router]/deployment/history`);

  try {
    const userId = req.userId;
    const { appName, deploymentName } = req.query;

    const queryRes = await getDeploymentHistory(userId, appName, deploymentName);

    if (!queryRes) {
      res.status(501).json(responseDto(false, "Get deployment histroy failed. Internal error!"));
    } else {
      res.status(200).json(queryRes);
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
