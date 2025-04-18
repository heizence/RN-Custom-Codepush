const API = require("../libs/APIs");

const getDeploymentList = async (appName, arg) => {
  // arg : argument which is not required for this command
  if (!appName || arg) {
    console.log(`Usage: greenlight-codepush deployment list <appName>\n`);
    return;
  }
  return await API.getDeploymentList({ appName });
};

const getDeploymentHistory = async (appName, deploymentName, arg) => {
  // arg : argument which is not required for this command
  if (!appName || !deploymentName || arg) {
    console.log(`Usage: greenlight-codepush deployment history <appName> <deploymentName>\n`);
    return;
  }
  return await API.getDeploymentHistory({ appName, deploymentName });
};

const addDeployment = async (appName, deploymentName, arg) => {
  // arg : argument which is not required for this command
  if (!appName || !deploymentName || arg) {
    console.log(`Usage: greenlight-codepush deployment add <appName> <deploymentName>\n`);
    return;
  }
  return await API.addDeployment({ appName, deploymentName });
};

const clearDeployment = async (appName, deploymentName, arg) => {
  // arg : argument which is not required for this command
  if (!appName || !deploymentName || arg) {
    console.log(`Usage: greenlight-codepush deployment clear <appName> <deploymentName>\n`);
    return;
  }
  return await API.clearDeployment({ appName, deploymentName });
};

const removeDeployment = async (appName, deploymentName, arg) => {
  // arg : argument which is not required for this command
  if (!appName || !deploymentName || arg) {
    console.log(`Usage: greenlight-codepush deployment remove <appName> <deploymentName>\n`);
    return;
  }
  return await API.removeDeployment({ appName, deploymentName });
};

const renameDeployment = async (appName, currentDeploymentName, newDeploymentName) => {
  if (!appName || !currentDeploymentName || !newDeploymentName) {
    console.log(`Usage: greenlight-codepush deployment rename <appName> <currentDeploymentName> <newDeploymentName>\n`);
    return;
  }
  return await API.renameDeployment({ appName, currentDeploymentName, newDeploymentName });
};

const printCommandGuide = () => {
  console.log(`Usage: greenlight-codepush deployment <command>\n`);
  console.log("commands : ");
  console.log(`  greenlight-codepush deployment add       Add a new deployment to an app`);
  console.log(`  greenlight-codepush deployment clear    Clear the release history associated with a deployment`);
  console.log(`  greenlight-codepush deployment remove    Remove a deployment from an app`);
  console.log(`  greenlight-codepush deployment rename    Rename an existing deployment`);
  console.log(`  greenlight-codepush deployment list      Lists the deployments associated with an app`);
  console.log(`  greenlight-codepush deployment history      Display the release history for a deployment`);
};

const handleDeploymentCommand = async (arg1, arg2, arg3, arg4) => {
  switch (arg1) {
    case "list":
      getDeploymentList(arg2, arg3);
      break;
    case "history":
      getDeploymentHistory(arg2, arg3, arg4);
      break;
    case "add":
      addDeployment(arg2, arg3, arg4);
      break;
    case "clear":
      clearDeployment(arg2, arg3, arg4);
      break;
    case "remove":
      removeDeployment(arg2, arg3, arg4);
      break;
    case "rename":
      renameDeployment(arg2, arg3, arg4);
      break;
    default:
      printCommandGuide();
      break;
  }
};

module.exports = handleDeploymentCommand;
