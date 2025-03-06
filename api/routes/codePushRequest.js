const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // Specify upload directory
const router = express.Router();
const { uploadBundle, downloadBundle } = require("../services/codePushService");

router.post("/upload", upload.single("bundle"), async (req, res) => {
  try {
    console.log("File(bundle) received:", req.file); // bundle
    console.log("Additional fields:", JSON.stringify(req.body));

    if (!req.file) {
      return res.status(400).send({ error: "No file uploaded" });
    }

    try {
      const { appVersion, platform } = req.body;
      const result = await uploadBundle(appVersion, platform, req.file);
      console.log("Release to S3 successful");
      res.status(200).send({ message: "Release successful", data: result });
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: "Error uploading to S3", details: error.message });
    }
  } catch (err) {
    res.status(500).json({ error: "Error uploading to S3", details: err.message });
  }
});

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
