const handleStart = require("./command.start");
const { handleLogin, handleLogout, handleRegister } = require("./command.auth");
const handleAppCommand = require("./command.app");
const handleDeploymentCommand = require("./command.deployment");
const handleReleaseCommand = require("./command.release");

module.exports = {
  start: handleStart,
  login: handleLogin,
  logout: handleLogout,
  register: handleRegister,
  app: handleAppCommand,
  deployment: handleDeploymentCommand,
  release: handleReleaseCommand,
};
