const express = require("express");
const router = express.Router();
const { addApp, renameApp, removeApp } = require("../database/query");
const { responseDto } = require("../DTO/response");

router.post("/add", async (req, res) => {
  console.log(`\n[router]/app/add`);
  try {
    const tokenInfo = req.tokenInfo;
    const newApp = await addApp(req.body.appName, tokenInfo.accountId);
    if (!newApp) {
      res.status(500).json(responseDto(false, "Add app failed"));
    } else {
      res.status(200).json(responseDto(true, "Add app success", newApp));
    }
  } catch (err) {
    res.status(501).json(responseDto(false, "Add app failed. internal error!", err));
  }
});

router.post("/remove", async (req, res) => {
  console.log(`\n[router]/app/remove`);
  try {
    const tokenInfo = req.tokenInfo;
    const result = await removeApp(req.body.appName, tokenInfo.accountId);
    if (!result) {
      res.status(500).json(responseDto(false, "Remove app failed"));
    } else {
      res.status(200).json(responseDto(true, "Remove app success", ""));
    }
  } catch (err) {
    res.status(501).json(responseDto(false, "Remove app failed. internal error!", err));
  }
});

router.post("/rename", async (req, res) => {
  console.log(`\n[router]/app/remove`);
  try {
    const tokenInfo = req.tokenInfo;
    const { currentAppName, newAppName } = req.body;
    const result = await renameApp(currentAppName, newAppName, tokenInfo.accountId);
    if (!result) {
      res.status(500).json(responseDto(false, "Rename app failed"));
    } else {
      res.status(200).json(responseDto(true, "Rename app success", ""));
    }
  } catch (err) {
    res.status(501).json(responseDto(false, "Rename app failed. internal error!", err));
  }
});

router.get("/list", (req, res) => {
  console.log(`\n[router]/app/list`);
  res.status(200).json(responseDto(true, "Get list success", ""));
});

module.exports = router;
