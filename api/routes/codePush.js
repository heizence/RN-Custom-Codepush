const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const { uploadBundle, downloadBundle } = require("../services/codePushService");
const { checkArgsAndOptions } = require("../database/query");
const { responseDto } = require("../DTO/response");

// multer 설정
const upload = multer({ dest: "../uploads", limits: { fieldSize: 100 * 1024 * 1024 } });

router.post("/check", async (req, res, next) => {
  console.log(`\n[router]/codepush/check`);
  try {
    const userId = req.userId;
    const { appName, platform, deployment, targetBinaryVersion } = req.body;
    const queryRes = await checkArgsAndOptions(userId, appName, platform, deployment, targetBinaryVersion);

    if (!queryRes) {
      res.status(501).json(responseDto(false, "check failed. Internal error!"));
    } else {
      res.status(200).json(queryRes);
    }
  } catch (err) {
    next(err);
  }
});

router.post("/upload", upload.single("bundle"), async (req, res, next) => {
  console.log(`\n[router]/codepush/upload`);
  try {
    const userId = req.userId;
    const { appName, platform, deployment, targetBinaryVersion } = req.body;
    console.log("req.file : ", req.file);
    res.status(501).json(responseDto(false, "check failed. Internal error!"));
    return; // working...

    const queryRes = await checkArgsAndOptions(userId, appName, platform, deployment, targetBinaryVersion);

    if (!queryRes) {
      res.status(501).json(responseDto(false, "check failed. Internal error!"));
    } else {
      res.status(200).json(queryRes);
    }
  } catch (err) {
    next(err);
  }
});

// upload
router.post("/upload2", upload.single("bundle"), async (req, res) => {
  try {
    console.log("File(bundle) received:", req.file); // bundle
    console.log("Additional fields:", JSON.stringify(req.body));

    if (!req.file) {
      return res.status(400).send({ error: "No file uploaded" });
    }

    const { appVersion, platform } = req.body;
    const result = await uploadBundle(appVersion, platform, req.file);
    console.log("Release to S3 successful");
    res.status(200).send({ message: "Release successful", data: result });
  } catch (err) {
    res.status(500).json({ error: "Error uploading to S3", details: err.message });
  }
});

// temp
router.get("/download/:platform/:version", async (req, res) => {
  try {
    const { platform, version } = req.params;
    const data = await downloadBundle(platform, version);
    res.status(200).send(data.Body); // Send the bundle as a response
  } catch (err) {
    res.status(404).json({ error: "Bundle not found", details: err.message });
  }
});

module.exports = router;
