const crypto = require("crypto");

// Function to generate random deployment key
const generateDeploymentKey = (length = 30) => {
  // Generate a secure random string using 'crypto' module
  const randomBytes = crypto.randomBytes(length);

  // Convert to base64 and remove padding
  const randomKey = randomBytes.toString("base64").replace(/=/g, "").slice(0, length);

  // Optionally, you can add some characters if you want to mix it further.
  return randomKey;
};

module.exports = generateDeploymentKey;
