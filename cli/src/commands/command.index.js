const handleStart = require("./command.start");
const { handleLogin, handleLogout, handleRegister } = require("./command.auth");
const handleAppCommand = require("./command.app");
const handleDeploymentCommand = require("./command.deployment");

module.exports = {
  start: handleStart,
  login: handleLogin,
  logout: handleLogout,
  register: handleRegister,
  app: handleAppCommand,
  deployment: handleDeploymentCommand,
};
