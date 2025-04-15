const API = require("../libs/APIs");

const getAppList = async arg => {
  // arg : argument which is not required for this command
  if (arg) {
    console.log(`Usage: greenlight-codepush app list\n`);
    return;
  }
  return await API.getApplist();
};

const addApp = async (appName, arg) => {
  // arg : argument which is not required for this command
  if (!appName || arg) {
    console.log(`Usage: greenlight-codepush app add <appName>\n`);
    return;
  }
  return await API.addApp({ appName });
};

const removeApp = async (appName, arg) => {
  // arg : argument which is not required for this command
  if (!appName || arg) {
    console.log(`Usage: greenlight-codepush app remove <appName>\n`);
    return;
  }
  return await API.removeApp({ appName });
};

const renameApp = async (currentAppName, newAppName) => {
  if (!currentAppName || !newAppName) {
    console.log(`Usage: greenlight-codepush app rename <currentAppName> <newAppName>\n`);
    return;
  }
  return await API.renameApp({ currentAppName, newAppName });
};

const handleAppCommand = async (arg1, arg2, arg3) => {
  switch (arg1) {
    case "add":
      addApp(arg2, arg3);
      break;
    case "list":
      getAppList(arg2, arg3);
      break;
    case "remove":
      removeApp(arg2, arg3);
      break;
    case "rename":
      renameApp(arg2, arg3);
      break;
    default:
      console.log(`Usage: greenlight-codepush app <command>\n`);
      console.log("commands : ");
      console.log(`  greenlight-codepush app add       Add a new app to your account`);
      console.log(`  greenlight-codepush app remove    Remove an app from your account`);
      console.log(`  greenlight-codepush app rename    Rename an existing app`);
      console.log(`  greenlight-codepush app list      Lists the apps associated with your account`);
      break;
  }
};

module.exports = handleAppCommand;
