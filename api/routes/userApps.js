const express = require("express");
const router = express.Router();
const { addApp, renameApp, removeApp, getAppListByUser } = require("../database/query");
const { responseDto } = require("../DTO/response");

router.get("/list", async (req, res) => {
  console.log(`\n[router]/app/list`);

  try {
    const userId = req.userId;
    const queryRes = await getAppListByUser(userId);

    if (!queryRes) {
      res.status(501).json(responseDto(false, "Get list failed. Internal error!"));
    } else {
      res.status(200).json(queryRes);
    }
  } catch (err) {
    res.status(501).json(responseDto(false, "Get list failed. Internal error!", err));
  }
});

router.get("/find", async (req, res) => {
  console.log(`\n[router]/app/find`);

  try {
    const userId = req.userId;
    const appName = req.query.appName;
    const checkApp = await findApp(userId, appName);
    console.log("queryRes : ", queryRes);

    if (checkApp.length === 0) {
      res.status(404).json(responseDto(false, `App "${appName}" doesn't exist!`));
      //res.status(501).json(responseDto(false, "Get list failed. Internal error!"));
    } else {
      res.status(200).json(queryRes);
    }
  } catch (err) {
    res.status(501).json(responseDto(false, "Get list failed. Internal error!", err));
  }
});

router.post("/add", async (req, res) => {
  console.log(`\n[router]/app/add`);
  try {
    const userId = req.userId;
    const appName = req.body.appName;

    const queryRes = await addApp(userId, appName);
    if (!queryRes) {
      res.status(501).json(responseDto(false, "Add app failed. Internal error!"));
    } else {
      res.status(200).json(queryRes);
    }
  } catch (err) {
    res.status(501).json(responseDto(false, "Add app failed. Internal error!", err));
  }
});

router.post("/remove", async (req, res) => {
  console.log(`\n[router]/app/remove`);
  try {
    const userId = req.userId;
    const appName = req.body.appName;

    const queryRes = await removeApp(userId, appName);
    if (!queryRes) {
      res.status(501).json(responseDto(false, "Remove app failed. Internal error!"));
    } else {
      res.status(200).json(queryRes);
    }
  } catch (err) {
    res.status(501).json(responseDto(false, "Remove app failed. Internal error!", err));
  }
});

router.post("/rename", async (req, res) => {
  console.log(`\n[router]/app/remove`);
  try {
    const userId = req.userId;
    const { currentAppName, newAppName } = req.body;

    const queryRes = await renameApp(userId, currentAppName, newAppName);
    if (!queryRes) {
      res.status(501).json(responseDto(false, "Rename app failed. Internal error!"));
    } else {
      res.status(200).json(queryRes);
    }
  } catch (err) {
    res.status(501).json(responseDto(false, "Rename app failed. Internal error!", err));
  }
});

module.exports = router;
