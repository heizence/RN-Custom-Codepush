const chalk = require("chalk");
const packageJson = require("../../package.json");

const handleStart = () => {
  const asciiArt = [
    "   ______                     __        __    __     ______          __     ____             __  ",
    "  / ____/_______  ___  ____  / (_)___ _/ /_  / /_   / ____/___  ____/ /__  / __ \\__  _______/ /_ ",
    " / / __/ ___/ _ \\/ _ \\/ __ \\/ / / __ `/ __ \\/ __/  / /   / __ \\/ __  / _ \\/ /_/ / / / / ___/ __ \\",
    "/ /_/ / /  /  __/  __/ / / / / / /_/ / / / / /_   / /___/ /_/ / /_/ /  __/ ____/ /_/ (__  ) / / /",
    "\\____/_/   \\___/\\___/_/ /_/_/_/\\__, /_/ /_/\\__/   \\____/\\____/\\__,_/\\___/_/    \\__,_/____/_/ /_/" + "            CLI v" + packageJson.version,
    "                              /____/                                                              ",
    "===================================================================================================",
  ];
  asciiArt.forEach(line => {
    console.log(chalk.green(line)); // Apply green color to each line
  });
  console.log("");
  console.log("Greenlight CodePush is a service that enables you to deploy mobile app updates directly to your users' devices.\n");
};

module.exports = handleStart;
