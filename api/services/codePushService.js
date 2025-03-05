// This is where the core logic for interacting with AWS S3 resides. The service handles tasks like uploading and downloading bundles.

const s3 = require("../config/awsConfig");
const fs = require("fs");
const path = require("path");

// Function to upload bundle to S3
exports.uploadBundle = async (appVersion, platform, bundle) => {
  const s3Key = `${platform}/${appVersion}/bundle.zip`;
  const fileBuffer = fs.readFileSync(bundle.path); // Read file into memory

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: s3Key,
    Body: fileBuffer,
    ContentType: "application/zip",
    ACL: "public-read", // You can adjust permissions
  };

  return s3.upload(params).promise(); // Upload and return result
};

// Function to download bundle from S3
exports.downloadBundle = async (platform, version) => {
  const s3Key = `${platform}/${version}/bundle.zip`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: s3Key,
  };

  return s3.getObject(params).promise(); // Get and return the bundle
};
