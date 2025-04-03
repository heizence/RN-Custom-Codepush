const express = require("express");
const router = express.Router();
const { addApp, renameApp, removeApp, getAppListByUser } = require("../database/query");
const { responseDto } = require("../DTO/response");

router.post("/add", async (req, res) => {
  console.log(`\n[router]/app/add`);
  try {
    const tokenInfo = req.tokenInfo;
    const appName = req.body.appName;

    const queryRes = await addApp(appName, tokenInfo.accountId);
    if (!queryRes) {
      res.status(501).json(responseDto(false, "Add app failed. Internal error!"));
    } else {
      res.status(queryRes.statusCode).json(queryRes);
    }
  } catch (err) {
    res.status(501).json(responseDto(false, "Add app failed. Internal error!", err));
  }
});

router.post("/remove", async (req, res) => {
  console.log(`\n[router]/app/remove`);
  try {
    const tokenInfo = req.tokenInfo;

    const queryRes = await removeApp(req.body.appName, tokenInfo.accountId);
    if (!queryRes) {
      res.status(501).json(responseDto(false, "Remove app failed. Internal error!"));
    } else {
      res.status(queryRes.statusCode).json(queryRes);
    }
  } catch (err) {
    res.status(501).json(responseDto(false, "Remove app failed. Internal error!", err));
  }
});

router.post("/rename", async (req, res) => {
  console.log(`\n[router]/app/remove`);
  try {
    const tokenInfo = req.tokenInfo;
    const { currentAppName, newAppName } = req.body;

    const queryRes = await renameApp(currentAppName, newAppName, tokenInfo.accountId);
    if (!queryRes) {
      res.status(501).json(responseDto(false, "Rename app failed. Internal error!"));
    } else {
      res.status(queryRes.statusCode).json(queryRes);
    }
  } catch (err) {
    res.status(501).json(responseDto(false, "Rename app failed. Internal error!", err));
  }
});

router.get("/list", async (req, res) => {
  console.log(`\n[router]/app/list`);

  try {
    const tokenInfo = req.tokenInfo;

    const queryRes = await getAppListByUser(tokenInfo.accountId);
    if (!queryRes) {
      res.status(501).json(responseDto(false, "Get list failed. Internal error!"));
    } else {
      res.status(queryRes.statusCode).json(queryRes);
    }
  } catch (err) {
    res.status(501).json(responseDto(false, "Get list failed. Internal error!", err));
  }
});

module.exports = router;
