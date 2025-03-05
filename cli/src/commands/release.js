const axios = require("axios");
const fs = require("fs");
const superagent = require("superagent");

// Handle the release of a new bundle
exports.handleRelease = async options => {
  const { app, platform, deployment, bundle, serverUrl } = options;
  const filePath = "/Users/dev/workplace_private/custom_codepush/cli/test_bundle.zip"; // Path to your .zip file

  try {
    await superagent
      .post(`${serverUrl}/api/codepush/upload`)
      .attach("bundle", fs.createReadStream(filePath)) // Attach the file to the request
      .field("appVersion", "1.0.1")
      .field("platform", "ios")
      .field("deployment", "Production")
      .set("Accept", "application/json");

    console.log("Upload successful"); // Handle response from server
  } catch (err) {
    console.error("Error uploading file: ", err.message.slice(0, 200)); // Handle any errors
  }
};
