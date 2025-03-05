//  This file handles the configuration for AWS S3. It initializes the AWS SDK with the credentials and region.

// Load the AWS SDK
const AWS = require("aws-sdk");

// Configure AWS SDK with credentials and region
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "us-east-1",
  signatureVersion: "v4",
});

module.exports = new AWS.S3(); // Export the configured S3 instance
